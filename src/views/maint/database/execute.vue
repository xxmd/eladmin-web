<template>
  <el-dialog append-to-body :close-on-click-modal="false" v-model="dialog" title="执行脚本" width="400px">
    <el-form ref="form" :rules="rules">
      <el-upload
        :action="databaseUploadApi"
        :data="databaseInfo"
        :headers="headers"
        :on-success="handleSuccess"
        :on-error="handleError"
        class="upload-demo"
        drag
      >
        <IconUpload class="legacy-icon " />
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <template #tip><div  class="el-upload__tip">上传后，系统会自动执行SQL脚本</div></template>
      </el-upload>
    </el-form>
    <template #footer><div  class="dialog-footer">
      <el-button type="primary" @click="cancel">关闭</el-button>
    </div></template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
export default defineComponent({
  props: {
    databaseInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      loading: false,
      dialog: false,
      headers: {
        Authorization: getToken()
      },
      rules: {}
    }
  },
  computed: {
    ...mapGetters(['databaseUploadApi'])
  },
  mounted() {
  },
  methods: {
    cancel() {
      this.dialog = false
    },
    handleSuccess(response: string) {
      if (response === 'success') {
        this.$notify({
          title: '执行成功',
          type: 'success',
          duration: 2500
        })
      } else {
        this.$notify({
          title: response,
          type: 'error',
          duration: 0
        })
      }
    },
    handleError(e: Error) {
      const msg = JSON.parse(e.message)
      this.$notify({
        title: msg.message,
        type: 'error',
        duration: 0
      })
    }
  }
})
</script>

<style scoped>
</style>
