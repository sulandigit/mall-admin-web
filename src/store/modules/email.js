import {
  fetchTemplateList,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplate,
  sendSingleEmail,
  sendBatchEmail,
  getBatchSendProgress,
  fetchRecordList,
  getRecordDetail,
  retryFailedEmail,
  getEmailConfig,
  updateEmailConfig,
  testSMTPConnection
} from '@/api/email'

const email = {
  state: {
    // 邮件模板相关状态
    templateList: [],
    currentTemplate: null,
    templateTypes: [
      { value: 'order', label: '订单通知' },
      { value: 'promotion', label: '促销信息' },
      { value: 'notification', label: '系统通知' },
      { value: 'welcome', label: '欢迎邮件' },
      { value: 'password', label: '密码重置' }
    ],
    templateLoading: false,
    templateTotal: 0,
    
    // 邮件发送相关状态
    sendStatus: {
      loading: false,
      progress: 0,
      total: 0,
      success: 0,
      failed: 0,
      taskId: null
    },
    recipientList: [],
    sendHistory: [],
    
    // 发送记录相关状态
    recordList: [],
    recordTotal: 0,
    recordQuery: {
      keyword: null,
      status: null,
      templateId: null,
      startTime: null,
      endTime: null,
      pageNum: 1,
      pageSize: 10
    },
    recordLoading: false,
    currentRecord: null,
    
    // 邮件配置相关状态
    emailConfig: {
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      smtpSsl: true,
      fromEmail: '',
      fromName: '',
      replyTo: '',
      timeout: 30000,
      maxRetries: 3
    },
    smtpStatus: 'unknown', // unknown, testing, success, failed
    configChanged: false
  },

  mutations: {
    // 模板相关mutations
    SET_TEMPLATE_LIST: (state, data) => {
      state.templateList = data.list || []
      state.templateTotal = data.total || 0
    },
    SET_CURRENT_TEMPLATE: (state, template) => {
      state.currentTemplate = template
    },
    SET_TEMPLATE_LOADING: (state, loading) => {
      state.templateLoading = loading
    },
    ADD_TEMPLATE: (state, template) => {
      state.templateList.unshift(template)
      state.templateTotal += 1
    },
    UPDATE_TEMPLATE: (state, template) => {
      const index = state.templateList.findIndex(item => item.id === template.id)
      if (index !== -1) {
        state.templateList.splice(index, 1, template)
      }
    },
    REMOVE_TEMPLATE: (state, templateId) => {
      const index = state.templateList.findIndex(item => item.id === templateId)
      if (index !== -1) {
        state.templateList.splice(index, 1)
        state.templateTotal -= 1
      }
    },

    // 发送相关mutations
    SET_SEND_STATUS: (state, status) => {
      state.sendStatus = { ...state.sendStatus, ...status }
    },
    RESET_SEND_STATUS: (state) => {
      state.sendStatus = {
        loading: false,
        progress: 0,
        total: 0,
        success: 0,
        failed: 0,
        taskId: null
      }
    },
    SET_RECIPIENT_LIST: (state, list) => {
      state.recipientList = list
    },
    ADD_SEND_HISTORY: (state, record) => {
      state.sendHistory.unshift(record)
      if (state.sendHistory.length > 10) {
        state.sendHistory = state.sendHistory.slice(0, 10)
      }
    },

    // 记录相关mutations
    SET_RECORD_LIST: (state, data) => {
      state.recordList = data.list || []
      state.recordTotal = data.total || 0
    },
    SET_RECORD_QUERY: (state, query) => {
      state.recordQuery = { ...state.recordQuery, ...query }
    },
    SET_RECORD_LOADING: (state, loading) => {
      state.recordLoading = loading
    },
    SET_CURRENT_RECORD: (state, record) => {
      state.currentRecord = record
    },
    UPDATE_RECORD_STATUS: (state, { id, status, errorMessage }) => {
      const record = state.recordList.find(item => item.id === id)
      if (record) {
        record.status = status
        if (errorMessage) {
          record.errorMessage = errorMessage
        }
      }
    },

    // 配置相关mutations
    SET_EMAIL_CONFIG: (state, config) => {
      state.emailConfig = { ...state.emailConfig, ...config }
    },
    SET_SMTP_STATUS: (state, status) => {
      state.smtpStatus = status
    },
    SET_CONFIG_CHANGED: (state, changed) => {
      state.configChanged = changed
    }
  },

  actions: {
    // 模板相关actions
    fetchTemplateList({ commit }, params) {
      commit('SET_TEMPLATE_LOADING', true)
      return new Promise((resolve, reject) => {
        fetchTemplateList(params).then(response => {
          commit('SET_TEMPLATE_LIST', response.data)
          commit('SET_TEMPLATE_LOADING', false)
          resolve(response.data)
        }).catch(error => {
          commit('SET_TEMPLATE_LOADING', false)
          reject(error)
        })
      })
    },

    createTemplate({ commit }, templateData) {
      return new Promise((resolve, reject) => {
        createTemplate(templateData).then(response => {
          commit('ADD_TEMPLATE', response.data)
          resolve(response.data)
        }).catch(error => {
          reject(error)
        })
      })
    },

    updateTemplate({ commit }, { id, data }) {
      return new Promise((resolve, reject) => {
        updateTemplate(id, data).then(response => {
          commit('UPDATE_TEMPLATE', response.data)
          resolve(response.data)
        }).catch(error => {
          reject(error)
        })
      })
    },

    deleteTemplate({ commit }, templateId) {
      return new Promise((resolve, reject) => {
        deleteTemplate(templateId).then(response => {
          commit('REMOVE_TEMPLATE', templateId)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    getTemplate({ commit }, templateId) {
      return new Promise((resolve, reject) => {
        getTemplate(templateId).then(response => {
          commit('SET_CURRENT_TEMPLATE', response.data)
          resolve(response.data)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 发送相关actions
    sendSingleEmail({ commit }, emailData) {
      commit('SET_SEND_STATUS', { loading: true })
      return new Promise((resolve, reject) => {
        sendSingleEmail(emailData).then(response => {
          commit('SET_SEND_STATUS', { loading: false })
          commit('ADD_SEND_HISTORY', response.data)
          resolve(response)
        }).catch(error => {
          commit('SET_SEND_STATUS', { loading: false })
          reject(error)
        })
      })
    },

    sendBatchEmail({ commit, dispatch }, emailData) {
      commit('SET_SEND_STATUS', { loading: true, total: emailData.recipients.length })
      return new Promise((resolve, reject) => {
        sendBatchEmail(emailData).then(response => {
          commit('SET_SEND_STATUS', { taskId: response.data.taskId })
          // 开始轮询进度
          dispatch('pollBatchProgress', response.data.taskId)
          resolve(response)
        }).catch(error => {
          commit('SET_SEND_STATUS', { loading: false })
          reject(error)
        })
      })
    },

    pollBatchProgress({ commit, state }, taskId) {
      const poll = () => {
        getBatchSendProgress(taskId).then(response => {
          const progress = response.data
          commit('SET_SEND_STATUS', {
            progress: progress.progress,
            success: progress.success,
            failed: progress.failed,
            loading: progress.status === 'processing'
          })
          
          if (progress.status === 'processing') {
            setTimeout(poll, 2000) // 每2秒轮询一次
          } else {
            commit('ADD_SEND_HISTORY', progress)
          }
        }).catch(error => {
          console.error('轮询批量发送进度失败:', error)
          commit('SET_SEND_STATUS', { loading: false })
        })
      }
      poll()
    },

    // 记录相关actions
    fetchRecordList({ commit, state }) {
      commit('SET_RECORD_LOADING', true)
      return new Promise((resolve, reject) => {
        fetchRecordList(state.recordQuery).then(response => {
          commit('SET_RECORD_LIST', response.data)
          commit('SET_RECORD_LOADING', false)
          resolve(response.data)
        }).catch(error => {
          commit('SET_RECORD_LOADING', false)
          reject(error)
        })
      })
    },

    getRecordDetail({ commit }, recordId) {
      return new Promise((resolve, reject) => {
        getRecordDetail(recordId).then(response => {
          commit('SET_CURRENT_RECORD', response.data)
          resolve(response.data)
        }).catch(error => {
          reject(error)
        })
      })
    },

    retryFailedEmail({ commit }, recordId) {
      return new Promise((resolve, reject) => {
        retryFailedEmail(recordId).then(response => {
          commit('UPDATE_RECORD_STATUS', { id: recordId, status: 2 }) // 设置为发送中
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 配置相关actions
    fetchEmailConfig({ commit }) {
      return new Promise((resolve, reject) => {
        getEmailConfig().then(response => {
          commit('SET_EMAIL_CONFIG', response.data)
          commit('SET_CONFIG_CHANGED', false)
          resolve(response.data)
        }).catch(error => {
          reject(error)
        })
      })
    },

    updateEmailConfig({ commit }, configData) {
      return new Promise((resolve, reject) => {
        updateEmailConfig(configData).then(response => {
          commit('SET_EMAIL_CONFIG', configData)
          commit('SET_CONFIG_CHANGED', false)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    testSMTPConnection({ commit }, configData) {
      commit('SET_SMTP_STATUS', 'testing')
      return new Promise((resolve, reject) => {
        testSMTPConnection(configData).then(response => {
          commit('SET_SMTP_STATUS', 'success')
          resolve(response)
        }).catch(error => {
          commit('SET_SMTP_STATUS', 'failed')
          reject(error)
        })
      })
    }
  }
}

export default email