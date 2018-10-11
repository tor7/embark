import PropTypes from "prop-types";
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Page} from "tabler-react";

import {commands as commandsAction, listenToProcessLogs, processLogs as processLogsAction, stopProcessLogs} from "../actions";
import DataWrapper from "../components/DataWrapper";
import Processes from '../components/Processes';
import Console from '../components/Console';
import {getProcesses, getProcessLogs} from "../reducers/selectors";
import {EMBARK_PROCESS_NAME} from '../constants';

class HomeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { activeProcess: EMBARK_PROCESS_NAME };
  }

  componentDidMount() {
    this.updateTab();
  }

  isEmbark() {
    return this.state.activeProcess === EMBARK_PROCESS_NAME
  }

  updateTab(processName = EMBARK_PROCESS_NAME) {
    if (!this.isEmbark()){
      this.props.stopProcessLogs(this.state.activeProcess)
    }

    if (processName === EMBARK_PROCESS_NAME) {
      if (this.props.processes.length === 0) {
        this.props.fetchProcessLogs(processName);
      }
    } else {
      this.props.fetchProcessLogs(processName);
      this.props.listenToProcessLogs(processName);
    }

    this.setState({activeProcess: processName});
  }

  render() {
    return (
      <React.Fragment>
        <Page.Title className="my-5">Dashboard</Page.Title>
        <DataWrapper shouldRender={this.props.processes.length > 0 } {...this.props} render={({processes}) => (
          <Processes processes={processes} />
        )} />

        <DataWrapper shouldRender={this.props.processes.length > 0 } {...this.props} render={({processes, postCommand, processLogs}) => (
          <Console activeProcess={this.state.activeProcess}
                   postCommand={postCommand}
                   processes={processes}
                   processLogs={processLogs}
                   isEmbark={() => this.isEmbark}
                   updateTab={processName => this.updateTab(processName)} />
        )} />
      </React.Fragment>
    );
  }
}

HomeContainer.propTypes = {
  processes: PropTypes.arrayOf(PropTypes.object),
  postCommand: PropTypes.func,
  error: PropTypes.string,
  loading: PropTypes.bool
};

function mapStateToProps(state) {
  return {
    processes: getProcesses(state),
    error: state.errorMessage,
    processLogs: getProcessLogs(state),
    loading: state.loading
  };
}

export default connect(
  mapStateToProps,
  {
    postCommand: commandsAction.post,
    fetchProcessLogs: processLogsAction.request,
    listenToProcessLogs,
    stopProcessLogs
  }
)(HomeContainer);
