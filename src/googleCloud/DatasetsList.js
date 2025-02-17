import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './googleCloud.css';
import { withTranslation } from 'react-i18next';
import { Icon } from 'react-viewerbase';
// the follow two lines to test
// import PluginSwitch from './PluginSwitch.js';
// import { commandsManager } from './../App.js';

class DatasetsList extends Component {
  state = {
    search: '',
  };

  static propTypes = {
    datasets: PropTypes.array,
    loading: PropTypes.bool,
    error: PropTypes.string,
    onSelect: PropTypes.func,
  };

  static defaultProps = {
    loading: true,
  };

  renderTableRow = dataset => {
    return (
      <tr
        key={dataset.name}
        className={
          this.state.highlightedItem === dataset.name
            ? 'noselect active'
            : 'noselect'
        }
        onMouseEnter={() => {
          this.onHighlightItem(dataset.name);
        }}
        onClick={() => {
          // console.log("8888888")
          this.props.onSelect(dataset);
          //test if it is default display
          // commandsManager.runCommand('mpr2d');
        }}
      >
        <td>{dataset.name.split('/')[5]}</td>
      </tr>
    );
  };

  onHighlightItem(dataset) {
    this.setState({ highlightedItem: dataset });
  }

  render() {
    if (this.props.error) {
      return <p>{this.props.error}</p>;
    }

    const loadingIcon = (
      <Icon name="circle-notch" className="loading-icon-spin loading-icon" />
    );

    if (this.props.loading) {
      return loadingIcon;
    }

    const body = (
      <tbody id="DatasetList">
        {this.props.datasets.map(this.renderTableRow)}
      </tbody>
    );

    return (
      <table id="tblDatasetList" className="gcp-table table noselect">
        <thead>
          <tr>
            <th>{this.props.t('Dataset')}</th>
          </tr>
        </thead>
        {this.props.datasets && body}
      </table>
    );
  }
}

export default withTranslation('Common')(DatasetsList);
