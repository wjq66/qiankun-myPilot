import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoginStore = defineStore('loginInfo', () => {
    const userInfo = ref(null)
    const token = ref(null)
    const isAuthenticated = ref(false)
    const isLoading = ref(false)
    const errorMessage = ref('')

    const initFromProps = (props: any) => {
        userInfo.value = props.userInfo
        token.value = props.token
        isAuthenticated.value = true
    }
    const restoreUserInfo = () => {
        userInfo.value = JSON.parse(localStorage.getItem('userInfo') || 'null')
        isAuthenticated.value = localStorage.getItem('isAuthenticated') === 'true'
    }
     
    return {
        userInfo,
        token,
        isAuthenticated,
        isLoading,
        errorMessage,
        initFromProps,
        restoreUserInfo
    }
})