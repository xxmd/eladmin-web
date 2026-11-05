<template>
  <div class="json-editor">
    <textarea ref="textarea" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { markRaw } from 'vue'
import CodeMirror from 'codemirror'
import 'codemirror/addon/lint/lint'
import 'codemirror/lib/codemirror.css'
// 替换主题这里需修改名称
import 'codemirror/theme/idea.css'
import 'codemirror/mode/clike/clike'
export default defineComponent({
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
      editor: null as CodeMirror.EditorFromTextArea | null
    }
  },
  watch: {
    modelValue(value) {
      const editorValue = (this.editor?.getValue() ?? '')
      if (value !== editorValue) {
        this.editor?.setValue(this.modelValue)
      }
    },
    height(value) {
      this.editor?.setSize('auto', this.height)
    }
  },
  mounted() {
    this.editor = markRaw(CodeMirror.fromTextArea(this.$refs.textarea as HTMLTextAreaElement, {
      mode: 'text/x-java',
      lineNumbers: true,
      lint: true,
      lineWrapping: true,
      tabSize: 2,
      cursorHeight: 0.9,
      // 替换主题这里需修改名称
      theme: 'idea',
      readOnly: true
    }))
    this.editor?.setSize('auto', this.height)
    this.editor?.setValue(this.modelValue)
  },
  beforeUnmount() { this.editor?.toTextArea() },
  methods: {
    getValue() {
      return (this.editor?.getValue() ?? '')
    }
  }
})
</script>

<style scoped>
  .json-editor{
    height: 100%;
    margin-bottom: 10px;
  }
  .json-editor :deep(.CodeMirror) {
    font-size: 14px;
    font-weight:normal
  }
  .json-editor :deep(.CodeMirror-scroll) {
  }
  .json-editor :deep(.cm-s-rubyblue span.cm-string) {
    color: #F08047;
  }
</style>
