import './ToolbarRow.css';

import React, { Component } from 'react';
import {
  ExpandableToolMenu,
  RoundedButtonGroup,
  ToolbarButton,
  TableList,
  TableListItem,
} from 'react-viewerbase';
import { commandsManager, extensionManager } from './../App.js';

import ConnectedCineDialog from './ConnectedCineDialog';
// import ConnectedColormap from './ConnectedColormap';
import ConnectedLayoutButton from './ConnectedLayoutButton';
import ConnectedPluginSwitch from './ConnectedPluginSwitch.js';
import { MODULE_TYPES } from 'ohif-core';
import PropTypes, { element } from 'prop-types';
import { withTranslation } from 'react-i18next';
import cornerstone from 'cornerstone-core';

class ToolbarRow extends Component {
  // TODO: Simplify these? isOpen can be computed if we say "any" value for selected,
  // closed if selected is null/undefined
  static propTypes = {
    isLeftSidePanelOpen: PropTypes.bool.isRequired,
    isRightSidePanelOpen: PropTypes.bool.isRequired,
    selectedLeftSidePanel: PropTypes.string.isRequired,
    selectedRightSidePanel: PropTypes.string.isRequired,
    handleSidePanelChange: PropTypes.func,
    activeContexts: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  constructor(props) {
    super(props);

    this.canvas = React.createRef();

    const toolbarButtonDefinitions = _getVisibleToolbarButtons.call(this);
    // TODO:
    // If it's a tool that can be active... Mark it as active?
    // - Tools that are on/off?
    // - Tools that can be bound to multiple buttons?

    // Normal ToolbarButtons...
    // Just how high do we need to hoist this state?
    // Why ToolbarRow instead of just Toolbar? Do we have any others?
    this.state = {
      toolbarButtons: toolbarButtonDefinitions,
      activeButtons: [],
      isCineDialogOpen: false,
      isColormapOpen: false,
    };

    this._handleBuiltIn = _handleBuiltIn.bind(this);

    const panelModules = extensionManager.modules[MODULE_TYPES.PANEL];
    this.buttonGroups = {
      left: [
        // TODO: This should come from extensions, instead of being baked in
        {
          value: 'studies',
          icon: 'th-large',
          bottomLabel: this.props.t('Series'),
        },
      ],
      right: [],
    };

    panelModules.forEach(panelExtension => {
      const panelModule = panelExtension.module;
      const defaultContexts = Array.from(panelModule.defaultContext);

      // MENU OPTIONS
      panelModule.menuOptions.forEach(menuOption => {
        const contexts = Array.from(menuOption.context || defaultContexts);

        const activeContextIncludesAnyPanelContexts = this.props.activeContexts.some(
          actx => contexts.includes(actx)
        );
        if (activeContextIncludesAnyPanelContexts) {
          const menuOptionEntry = {
            value: menuOption.target,
            icon: menuOption.icon,
            bottomLabel: menuOption.label,
          };
          const from = menuOption.from || 'right';

          this.buttonGroups[from].push(menuOptionEntry);
        }
      });
    });
  }

  componentDidMount() {
    const ctx = this.canvas.current.getContext('2d')
    let colormap = cornerstone.colors.getColormap('winter');
    const lookupTable = colormap.createLookupTable();
    const height =this.canvas.current.height;
    const width = this.canvas.current.width;
    const colorbar = ctx.createImageData(64,20);

    lookupTable.setTableRange(0, width);

    for(let col = 0; col < width; col++) {
      const color = lookupTable.mapValue(col);
      // console.log(color);
      for(let row = 0; row < height; row++) {
          const pixel = (col + row * width) * 4;
          colorbar.data[pixel] = color[0];
          colorbar.data[pixel+1] = color[1];
          colorbar.data[pixel+2] = color[2];
          colorbar.data[pixel+3] = color[3];
      }
    }
    ctx.putImageData(colorbar, 0, 0);
    console.log(ctx)
  }

  componentDidUpdate(prevProps) {
    const activeContextsChanged =
      prevProps.activeContexts !== this.props.activeContexts;

    if (activeContextsChanged) {
      this.setState({
        toolbarButtons: _getVisibleToolbarButtons.call(this),
      });
    }
  }


  render() {
    const buttonComponents = _getButtonComponents.call(
      this,
      this.state.toolbarButtons,
      this.state.activeButtons
    );

    const cineDialogContainerStyle = {
      display: this.state.isCineDialogOpen ? 'block' : 'none',
      position: 'absolute',
      top: '82px',
      zIndex: 999,
    };

    const colormapContainerStyle = {
      display: this.state.isColormapOpen ? 'list-item' : 'none',
      position: "absolute",
      top: "120px",
      zIndex: 999,
      opacity: 0.7,
      left: '690px',
    }

    const onPress = (side, value) => {
      this.props.handleSidePanelChange(side, value);
    };
    const onPressLeft = onPress.bind(this, 'left');
    const onPressRight = onPress.bind(this, 'right');

    const colormapList = cornerstone.colors.getColormapsList();
    const  listItems = [
      { label: colormapList[1].id },
      { label: colormapList[2].id },
      { label: colormapList[3].id },
      { label: colormapList[4].id },
      { label: colormapList[5].id },
      { label: colormapList[6].id },
      { label: colormapList[7].id },
      { label: colormapList[8].id },
      { label: colormapList[9].id },
      { label: colormapList[10].id },
      { label: colormapList[11].id },
      { label: colormapList[12].id },
      { label: colormapList[13].id },
      { label: colormapList[14].id },
      { label: colormapList[15].id },
      { label: colormapList[16].id },
      { label: colormapList[17].id },
      { label: colormapList[18].id },
    ];

    // const enabledElement = _getActiveViewportEnabledElement(
    //   this.state.viewports.viewportSpecificData,
    //   this.state.viewports.activeViewportIndex
    // );


    return (
      <>
        <div className="ToolbarRow">
          <div className="pull-left m-t-1 p-y-1" style={{ padding: '10px' }}>
            <RoundedButtonGroup
              options={this.buttonGroups.left}
              value={this.props.selectedLeftSidePanel || ''}
              onValueChanged={onPressLeft}
            />
          </div>
          {buttonComponents}
          <ConnectedLayoutButton />
          <div
            className="pull-right m-t-1 rm-x-1"
            style={{ marginLeft: 'auto' }}
          >
            {this.buttonGroups.right.length && (
              <RoundedButtonGroup
                options={this.buttonGroups.right}
                value={this.props.selectedRightSidePanel || ''}
                onValueChanged={onPressRight}
              />
            )}
          </div>
        </div>
        <div className="CineDialogContainer" style={cineDialogContainerStyle}>
          <ConnectedCineDialog />
        </div>
        {/* className="btn-group" */}
        <div style={colormapContainerStyle} >

          {/* <ConnectedColormap /> */}
          <TableList>
            {listItems.map((item, index) => {
              return (
                <TableListItem
                  key={`item_${index}`}
                  // itemClass={this.selectedIndex === index ? 'selected' : ''}
                  itemIndex={index}
                  onItemClick={() => {
                    let enabledElement = this.props.viewports.viewportSpecificData[0].dom;
                    let viewport = cornerstone.getViewport(enabledElement);
                    viewport.colormap = listItems[index].label;
                    cornerstone.setViewport(enabledElement, viewport);
                    this.setState({
                      isColormapOpen: false,
                    });

                  }}
                >
                  {/* 注意JSX的语法，不能用双引号，要用大括号括起来，下面写法错误 */}
                  {/* <canvas id="colorbar" width="64" height="20"></canvas> */}
                  <canvas
                    ref={this.canvas}
                    width={64}
                    height={20}
                  >
                  </canvas>

                  <label>{item.label}</label>

                </TableListItem>
              )
            })}
          </TableList>

        </div>

        {/* <div onClick={commandsManager.runCommand('mpr2d')}>

        </div> */}
      </>
    );
  }
}


// function drawColorbar(canvas, colormapId) {
//   let colormap = cornerstone.colors.getColormap(colormapId);
//   const lookupTable = colormap.createLookupTable();
//   const ctx = canvas.getContext('2d');
//   const height = canvas.height;
//   const width = canvas.width;
//   const colorbar = ctx.createImageData(64,20);

//   lookupTable.setTableRange(0, width);

//   for(let col = 0; col < width; col++) {
//     const color = lookupTable.mapValue(col);
//     // console.log(color);
//     for(let row = 0; row < height; row++) {
//         const pixel = (col + row * width) * 4;
//         colorbar.data[pixel] = color[0];
//         colorbar.data[pixel+1] = color[1];
//         colorbar.data[pixel+2] = color[2];
//         colorbar.data[pixel+3] = color[3];
//     }
//   }
//   ctx.putImageData(colorbar, 0, 0);
// }

/**
 * Determine which extension buttons should be showing, if they're
 * active, and what their onClick behavior should be.
 */
function _getButtonComponents(toolbarButtons, activeButtons) {
  return toolbarButtons.map((button, index) => {
    let activeCommand = undefined;

    if (button.buttons && button.buttons.length) {
      // Iterate over button definitions and update `onClick` behavior
      const childButtons = button.buttons.map(childButton => {
        childButton.onClick = _handleToolbarButtonClick.bind(this, childButton);

        if (activeButtons.indexOf(childButton.id) > -1) {
          activeCommand = childButton.id;
        }

        return childButton;
      });

      return (
        <ExpandableToolMenu
          key={button.id}
          text={button.label}
          icon={button.icon}
          buttons={childButtons}
          activeCommand={activeCommand}
        />
      );
    }
    return (
      <ToolbarButton
        key={button.id}
        label={button.label}
        icon={button.icon}
        onClick={_handleToolbarButtonClick.bind(this, button)}
        isActive={activeButtons.includes(button.id)}
      />
    );
  });
}

/**
 * A handy way for us to handle different button types. IE. firing commands for
 * buttons, or initiation built in behavior.
 *
 * @param {*} button
 * @param {*} evt
 * @param {*} props
 */
function _handleToolbarButtonClick(button, evt, props) {
  if (button.commandName) {
    const options = Object.assign({ evt }, button.commandOptions);
    commandsManager.runCommand(button.commandName, options);
  }

  // TODO: Use Types ENUM
  // TODO: We can update this to be a `getter` on the extension to query
  //       For the active tools after we apply our updates?
  if (button.type === 'setToolActive') {
    this.setState({
      activeButtons: [button.id],
    });
  } else if (button.type === 'builtIn') {
    this._handleBuiltIn(button.options);
  }
}
/**
 *
 */
function _getVisibleToolbarButtons() {
  const toolbarModules = extensionManager.modules[MODULE_TYPES.TOOLBAR];
  const toolbarButtonDefinitions = [];

  toolbarModules.forEach(extension => {
    const { definitions, defaultContext } = extension.module;
    definitions.forEach(definition => {
      const context = definition.context || defaultContext;

      if (this.props.activeContexts.includes(context)) {
        toolbarButtonDefinitions.push(definition);
      }
    });
  });

  return toolbarButtonDefinitions;
}

function _handleBuiltIn({ behavior } = {}) {
  if (behavior === 'CINE') {
    this.setState({
      isCineDialogOpen: !this.state.isCineDialogOpen,
    });
  }

  if (behavior === 'Colormap') {
    this.setState({
      isColormapOpen: !this.state.isColormapOpen,
    });
  }
}

export default withTranslation('Common')(ToolbarRow);
