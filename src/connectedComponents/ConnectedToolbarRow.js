// TODO: REPLACE THIS WITH A CONTEXT PROVIDER
// EVERYTHING IN `VIEWER.JS` COULD USE THIS FOR APPROPRIATE CONTEXT
import ToolbarRow from './ToolbarRow';
import { connect } from 'react-redux';
import { getActiveContexts } from './../store/layout/selectors.js';
import { domainToASCII } from 'url';

const mapStateToProps = state => {
  return {
    activeContexts: getActiveContexts(state),
    viewports: state.viewports,
  };
};

const ConnectedToolbarRow = connect(mapStateToProps)(ToolbarRow);

export default ConnectedToolbarRow;
