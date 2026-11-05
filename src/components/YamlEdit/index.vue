<template>
  <div class="json-editor">
    <textarea ref="textarea" />
  </div>
</template>

<script>
import { markRaw } from 'vue'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
// 替换主题这里需修改名称
import 'codemirror/theme/idea.css'
import 'codemirror/mode/yaml/yaml'
export default {
  props: {
    modelValue: {
      type: String,
      required: true
    },
    height: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      editor: false
    }
  },
  watch: {
    modelValue(value) {
      const editorValue = this.editor.getValue()
      if (value !== editorValue) {
        this.editor.setValue(this.modelValue)
      }
    },
    height(value) {
      this.editor.setSize('auto', this.height)
    }
  },
  mounted() {
    this.editor = markRaw(CodeMirror.fromTextArea(this.$refs.textarea, {
      mode: 'text/x-yaml',
      lineNumbers: true,
      lint: true,
      lineWrapping: true,
      tabSize: 2,
      cursorHeight: 0.9,
      // 替换主题这里需修改名称
      theme: 'idea'
    }))
    this.editor.setSize('auto', this.height)
    this.editor.setValue(this.modelValue)
    this.editor.on('change', cm => {
      this.$emit('changed', cm.getValue())
      this.$emit('update:modelValue', cm.getValue())
    })
  },
  beforeUnmount() { this.editor?.toTextArea() },
  methods: {
    getValue() {
      return this.editor.getValue()
    }
  }
}
</script>

<style scoped>
  .json-editor{
    height: 100%;
    margin-bottom: 10px;
  }
  .json-editor :deep(.CodeMirror) {
    font-size: 13px;
    overflow-y:auto;
    font-weight:normal
  }
  .json-editor :deep(.CodeMirror-scroll) {
  }
  .json-editor :deep(.cm-s-rubyblue span.cm-string) {
    color: #F08047;
  }
</style>
