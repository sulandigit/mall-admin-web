<template>
  <div class="tinymce-container editor-container">
    <textarea class="tinymce-textarea" :id="tinymceId"></textarea>
    <div class="editor-custom-btn-container">
      <editorImage color="#1890ff" class="editor-upload-btn" @successCBK="imageSuccessCBK"></editorImage>
    </div>
  </div>
</template>

<script>
  import editorImage from './components/editorImage'
  import '../../../static/tinymce4.7.5/langs/zh_CN'

  const plugins = [
    'advlist anchor autolink autosave code codesample colorpicker',
    'contextmenu directionality emoticons fullscreen hr image imagetools',
    'importcss insertdatetime legacyoutput link lists media nonbreaking',
    'noneditable pagebreak paste preview print save searchreplace',
    'spellchecker tabfocus table template textcolor textpattern',
    'visualblocks visualchars wordcount charmap help quickbars'
  ].join(' ');
  
  const toolbar = [
    'undo redo | formatselect fontselect fontsizeselect',
    'bold italic underline strikethrough | forecolor backcolor',
    'alignleft aligncenter alignright alignjustify',
    'outdent indent | bullist numlist | blockquote hr',
    'link unlink anchor image media | table charmap emoticons',
    'code codesample | fullscreen preview print | help'
  ];
  export default {
    name: 'tinymce',
    components: {editorImage},
    props: {
      id: {
        type: String
      },
      value: {
        type: String,
        default: ''
      },
      toolbar: {
        type: Array,
        required: false,
        default() {
          return []
        }
      },
      menubar: {
        default: 'file edit insert view format table'
      },
      height: {
        type: Number,
        required: false,
        default: 360
      },
      width: {
        type: Number,
        required: false,
        default: 720
      }
    },
    data() {
      return {
        hasChange: false,
        hasInit: false,
        tinymceId: this.id || 'vue-tinymce-' + +new Date()
      }
    },
    watch: {
      value(val) {
        if (!this.hasChange && this.hasInit) {
          this.$nextTick(() => window.tinymce.get(this.tinymceId).setContent(val))
        }
      }
    },
    mounted() {
      this.initTinymce()
    },
    activated() {
      this.initTinymce()
    },
    deactivated() {
      this.destroyTinymce()
    },
    methods: {
      initTinymce() {
        const _this = this
        window.tinymce.init({
          selector: `#${this.tinymceId}`,
          width: this.width,
          height: this.height,
          language: 'zh_CN',
          
          // 基础配置
          body_class: 'panel-body',
          object_resizing: false,
          toolbar: this.toolbar.length > 0 ? this.toolbar : toolbar,
          menubar: this.menubar,
          plugins: plugins,
          
          // 内容样式
          content_css: [
            '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
            '//www.tiny.cloud/css/codepen.min.css'
          ],
          
          // 字体配置
          font_formats: '
            微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;
            苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;
            宋体=simsun,serif;
            仿宋体=FangSong,serif;
            黑体=SimHei,sans-serif;
            Arial=arial,helvetica,sans-serif;
            Arial Black=arial black,avant garde;
            Book Antiqua=book antiqua,palatino;
            Comic Sans MS=comic sans ms,sans-serif;
            Courier New=courier new,courier;
            Georgia=georgia,palatino;
            Helvetica=helvetica;
            Impact=impact,chicago;
            Symbol=symbol;
            Tahoma=tahoma,arial,helvetica,sans-serif;
            Terminal=terminal,monaco;
            Times New Roman=times new roman,times;
            Trebuchet MS=trebuchet ms,geneva;
            Verdana=verdana,geneva;
            Webdings=webdings;
            Wingdings=wingdings,zapf dingbats
          ',
          
          // 字号配置
          fontsize_formats: '8px 9px 10px 11px 12px 14px 16px 18px 20px 22px 24px 26px 28px 36px 48px 72px',
          
          // 高级配置
          end_container_on_empty_block: true,
          powerpaste_word_import: 'clean',
          code_dialog_height: 450,
          code_dialog_width: 1000,
          advlist_bullet_styles: 'square',
          advlist_number_styles: 'default',
          imagetools_cors_hosts: ['www.tinymce.com', 'codepen.io'],
          default_link_target: '_blank',
          link_title: false,
          
          // 图片上传配置
          images_upload_handler: function (blobInfo, success, failure) {
            // 这里可以实现图片上传逻辑
            success(blobInfo.blobUri());
          },
          
          // 自定义样式
          style_formats: [
            {
              title: '标题样式',
              items: [
                { title: '主标题', format: 'h1' },
                { title: '副标题', format: 'h2' },
                { title: '三级标题', format: 'h3' },
                { title: '四级标题', format: 'h4' },
                { title: '五级标题', format: 'h5' },
                { title: '六级标题', format: 'h6' }
              ]
            },
            {
              title: '文本样式',
              items: [
                { title: '段落', format: 'p' },
                { title: '引用', format: 'blockquote' },
                { title: '代码', format: 'code' },
                { title: '预格式文本', format: 'pre' }
              ]
            },
            {
              title: '对齐方式',
              items: [
                { title: '左对齐', format: 'alignleft' },
                { title: '居中对齐', format: 'aligncenter' },
                { title: '右对齐', format: 'alignright' },
                { title: '两端对齐', format: 'alignjustify' }
              ]
            }
          ],
          
          // 表格配置
          table_default_attributes: {
            border: '1'
          },
          table_default_styles: {
            'border-collapse': 'collapse',
            'width': '100%'
          },
          
          // 快捷键配置
          setup: function(editor) {
            // 自定义快捷键
            editor.addShortcut('ctrl+shift+s', '保存内容', function() {
              _this.$emit('save', editor.getContent());
            });
            
            editor.addShortcut('ctrl+shift+p', '预览内容', function() {
              editor.execCommand('mcePreview');
            });
          },
          
          // 初始化回调
          init_instance_callback: editor => {
            if (_this.value) {
              editor.setContent(_this.value)
            }
            _this.hasInit = true
            
            // 监听内容变化
            editor.on('NodeChange Change KeyUp SetContent', () => {
              _this.hasChange = true
              _this.$emit('input', editor.getContent())
            })
            
            // 监听焦点事件
            editor.on('focus', () => {
              _this.$emit('focus', editor)
            })
            
            editor.on('blur', () => {
              _this.$emit('blur', editor)
            })
            
            // 触发初始化完成事件
            _this.$emit('init', editor)
          }
        })
      },
      destroyTinymce() {
        if (window.tinymce.get(this.tinymceId)) {
          window.tinymce.get(this.tinymceId).destroy()
        }
      },
      /**
       * 获取编辑器内容
       */
      getContent() {
        const editor = window.tinymce.get(this.tinymceId)
        return editor ? editor.getContent() : ''
      },
      
      /**
       * 设置编辑器内容
       */
      setContent(value) {
        const editor = window.tinymce.get(this.tinymceId)
        if (editor) {
          editor.setContent(value)
        }
      },
      
      /**
       * 插入内容
       */
      insertContent(content) {
        const editor = window.tinymce.get(this.tinymceId)
        if (editor) {
          editor.insertContent(content)
        }
      },
      
      /**
       * 获取纯文本内容
       */
      getTextContent() {
        const editor = window.tinymce.get(this.tinymceId)
        return editor ? editor.getContent({ format: 'text' }) : ''
      },
      
      /**
       * 聚焦编辑器
       */
      focus() {
        const editor = window.tinymce.get(this.tinymceId)
        if (editor) {
          editor.focus()
        }
      },
      /**
       * 图片上传成功回调
       */
      imageSuccessCBK(arr) {
        const _this = this
        arr.forEach(v => {
          _this.insertContent(`<img class="wscnph" src="${v.url}" style="max-width: 100%; height: auto;" />`)
        })
      }
    },
    destroyed() {
      this.destroyTinymce()
    }
  }
</script>

<style scoped>
  .tinymce-container {
    position: relative;
  }

  .tinymce-container >>> .mce-fullscreen {
    z-index: 10000;
  }

  .tinymce-textarea {
    visibility: hidden;
    z-index: -1;
  }

  .editor-custom-btn-container {
    position: absolute;
    right: 10px;
    top: 2px;
    /*z-index: 2005;*/
  }

  .editor-upload-btn {
    display: inline-block;
  }
</style>
