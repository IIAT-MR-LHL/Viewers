import {
  connect
} from 'react-redux';
import {
  CineDialog
} from 'react-viewerbase';
import OHIF from 'ohif-core';
import csTools from 'cornerstone-tools';
// Our target output kills the `as` and "import" throws a keyword error
// import { import as toolImport, getToolState } from 'cornerstone-tools';
import cloneDeep from 'lodash.clonedeep';
import cornerstone from 'cornerstone-core';

const toolImport = csTools.import;
const scrollToIndex = toolImport('util/scrollToIndex');
const {
  setViewportSpecificData
} = OHIF.redux.actions;

// Why do I need or care about any of this info?
// A dispatch action should be able to pull this at the time of an event?
// `isPlaying` and `cineFrameRate` might matter, but I think we can prop pass for those.
const mapStateToProps = state => {
  // Get activeViewport's `cine` and `stack`
  const {
    viewportSpecificData,
    activeViewportIndex
  } = state.viewports;
  const {
    cine,
    dom
  } = viewportSpecificData[activeViewportIndex] || {};

  const cineData = cine || {
    isPlaying: false,
    cineFrameRate: 24,
  };

  // New props we're creating?
  return {
    activeEnabledElement: dom,
    activeViewportCineData: cineData,
    activeViewportIndex: state.viewports.activeViewportIndex,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatchSetViewportSpecificData: (viewportIndex, data) => {
      dispatch(setViewportSpecificData(viewportIndex, data));
    },
  };
};

const mergeProps = (propsFromState, propsFromDispatch, ownProps) => {
  const {
    activeEnabledElement,
    activeViewportCineData,
    activeViewportIndex,
  } = propsFromState;

  return {
    cineFrameRate: activeViewportCineData.cineFrameRate,
    isPlaying: activeViewportCineData.isPlaying,
    onPlayPauseChanged: isPlaying => {
      const cine = cloneDeep(activeViewportCineData);
      cine.isPlaying = !cine.isPlaying;

      propsFromDispatch.dispatchSetViewportSpecificData(activeViewportIndex, {
        cine,
      });
    },
    onFrameRateChanged: frameRate => {
      const cine = cloneDeep(activeViewportCineData);
      cine.cineFrameRate = frameRate;

      propsFromDispatch.dispatchSetViewportSpecificData(activeViewportIndex, {
        cine,
      });
    },
    // onClickNextButton: () => {
    //   const stackData = csTools.getToolState(activeEnabledElement, 'stack');
    //   if (!stackData || !stackData.data || !stackData.data.length) return;
    //   const { currentImageIdIndex, imageIds } = stackData.data[0];
    //   if (currentImageIdIndex >= imageIds.length - 1) return;
    //   scrollToIndex(activeEnabledElement, currentImageIdIndex + 1);
    // },
    onClickNextButton: () => {
      const prevLayers = cornerstone.getLayers(activeEnabledElement);
      if (prevLayers.length >= 2) return;

      // add data to stackData
      const stackData1 = csTools.getToolState(activeEnabledElement, 'stack');
      console.log('stackData1', stackData1);
      // TODO get a complete stack temporary
      const ctStack = stackData1.data[0];
      csTools.addToolState(activeEnabledElement, 'stack', ctStack);
      const stackData = csTools.getToolState(activeEnabledElement, 'stack');
      /*      stackData.data[0].options = {opacity:0.6};
            stackData.data[1].options = {opacity:0.6};*/

      // get currentImageIdIndex and imageIds
      if (!stackData || !stackData.data || !stackData.data.length) return;
      const {
        currentImageIdIndex,
        imageIds
      } = stackData.data[0];
      const imageIds2 = stackData.data[1].imageIds;
      if (currentImageIdIndex >= imageIds.length - 1) return;

      /*      scrollToIndex(activeEnabledElement, currentImageIdIndex + 1);*/

      cornerstone.loadImage(imageIds[currentImageIdIndex + 1]).then(image => {
        cornerstone.addLayer(activeEnabledElement, image);
        const layers = cornerstone.getLayers(activeEnabledElement);
        if (layers.length > 1) {
          layers[layers.length - 1].options = {
            opacity: 1.0
          };
        }
      });
      cornerstone.loadImage(imageIds2[currentImageIdIndex + 1]).then(image => {
        cornerstone.addLayer(activeEnabledElement, image);
        const layers = cornerstone.getLayers(activeEnabledElement);
        if (layers.length > 1) {
          layers[layers.length - 1].options = {
            opacity: 0.8
          };
        }
      });
      const layers = cornerstone.getLayers(activeEnabledElement);
      console.log('layers', layers)
      console.log('newStack', csTools.getToolState(activeEnabledElement, 'stack'));

    },
    onClickBackButton: () => {
      const stackData = csTools.getToolState(activeEnabledElement, 'stack');
      if (!stackData || !stackData.data || !stackData.data.length) return;
      const {
        currentImageIdIndex
      } = stackData.data[0];
      if (currentImageIdIndex === 0) return;
      scrollToIndex(activeEnabledElement, currentImageIdIndex - 1);
    },
    onClickSkipToStart: () => {
      const stackData = csTools.getToolState(activeEnabledElement, 'stack');
      if (!stackData || !stackData.data || !stackData.data.length) return;
      scrollToIndex(activeEnabledElement, 0);
    },
    onClickSkipToEnd: () => {
      const stackData = csTools.getToolState(activeEnabledElement, 'stack');
      if (!stackData || !stackData.data || !stackData.data.length) return;
      const lastIndex = stackData.data[0].imageIds.length - 1;
      scrollToIndex(activeEnabledElement, lastIndex);
    },
  };
};

const ConnectedCineDialog = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(CineDialog);

export default ConnectedCineDialog;
