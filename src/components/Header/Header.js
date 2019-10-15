import './Header.css';
import './Header.css';
import axios from 'axios';

import { Link, withRouter } from 'react-router-dom';
import React, { Component } from 'react';

import { Dropdown } from 'react-viewerbase';
import OHIFLogo from '../OHIFLogo/OHIFLogo.js';
import PropTypes from 'prop-types';
import { AboutModal } from 'react-viewerbase';
import { hotkeysManager } from './../../App.js';
import { withTranslation } from 'react-i18next';

class Header extends Component {
  static propTypes = {
    home: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.node,
    t: PropTypes.func.isRequired,
    userManager: PropTypes.object
  };

  static defaultProps = {
    home: true,
    children: OHIFLogo(),
  };

  // onSave: data => {
  //   const contextName = store.getState().commandContext.context;
  //   const preferences = cloneDeep(store.getState().preferences);
  //   preferences[contextName] = data;
  //   dispatch(setUserPreferences(preferences));
  //   dispatch(setUserPreferencesModalOpen(false));
  //   OHIF.hotkeysUtil.setHotkeys(data.hotKeysData);
  // },
  // onResetToDefaults: () => {
  //   dispatch(setUserPreferences());
  //   dispatch(setUserPreferencesModalOpen(false));
  //   OHIF.hotkeysUtil.setHotkeys();
  // },

  constructor(props) {
    super(props);
    this.state = { isUserPreferencesOpen: false, isOpen: false };

    this.loadOptions();
  }

  loadOptions() {
    const { t } = this.props;
    this.options = [
      {
        title: t('About'),
        icon: { name: 'info' },
        onClick: () => {
          this.setState({
            isOpen: true,
          });
        },
      },
    ];

    if (this.props.user && this.props.userManager) {
      this.options.push({
        title: t('Logout'),
          icon: { name: 'power-off' },
          onClick: () => {
            this.props.userManager.signoutRedirect();
          },
      });
    }

    this.hotKeysData = hotkeysManager.hotkeyDefinitions;
  }

  fileInput(){
      document.getElementById("file").click();
  }

  handleUpload = (e) =>{
    e.preventDefault();
    let file = e.target.files;
    const formData = new FormData();
    for (let i = 0; i < file.length; i++) {
      formData.append('submission', file[i]);
    }
    //axios post function
    let url;
    axios({
      method: 'POST',
      url: "http://10.10.20.98:5000/api/images/upload/files",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }).then(resp => {
      console.log(resp.data);
    }).catch(err => console.log(err));
  };
  onUserPreferencesSave({ windowLevelData, hotKeysData }) {
    // console.log(windowLevelData);
    // console.log(hotKeysData);
    // TODO: Update hotkeysManager
    // TODO: reset `this.hotKeysData`
  }

  render() {
    const { t } = this.props;
    const showStudyList =
      window.config.showStudyList !== undefined
        ? window.config.showStudyList
        : true;
    return (
      <div className={`entry-header ${this.props.home ? 'header-big' : ''}`}>
        <div className="header-left-box">
          {this.props.location && this.props.location.studyLink && (
            <Link
              to={this.props.location.studyLink}
              className="header-btn header-viewerLink"
            >
              {t('Back to Viewer')}
            </Link>
          )}

          {this.props.children}

          {showStudyList && !this.props.home && (
            <Link
              className="header-btn header-studyListLinkSection"
              to={{
                pathname: '/',
                state: { studyLink: this.props.location.pathname },
              }}
            >
              {t('Study list')}
            </Link>
          )}
        </div>

        <div className="header-menu">
        <div className="a_upload" id="fileInput" onClick={this.fileInput}>
            {'Upload Study Files to DataBase'}
            <input className="uploadFile" type="file" multiple="multiple" id="file" onChange={this.handleUpload}/>
          </div>
          {/* <span className="research-use">{t('INVESTIGATIONAL USE ONLY')}</span>
          <Dropdown title={t('Options')} list={this.options} align="right" />
          <AboutModal
            {...this.state}
            onCancel={() =>
              this.setState({
                isOpen: false,
              })
            }
          /> */}
          {/* <select id="lngChange">
            <option value="English">English</option>
            <option value="Chinese">Chinese</option>
          </select> */}
          {/* <a href="localhost:5000?lng=zh">click</a> */}
            <a
              target="_parent"
              rel="noopener noreferrer"
              href="?lng=en"
            >
              <div className="lng">Eng</div>
            </a>
            <div className="lng">/</div>
            <a
              target="_parent"
              rel="noopener noreferrer"
              href="?lng=zh"
            >
              <div className="lng">中文</div>
            </a>
            {/* <input type="button" value="中文" onClick="location.href='localhost:5000?lng=zh'" /> */}
        </div>
      </div>
    );
  }
}

export default withTranslation('Header')(withRouter(Header));
