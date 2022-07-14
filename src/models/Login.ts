import { Options, Vue } from 'vue-class-component';
import DocumentMixin from '@/mixins/DocumentMixin'
import $ from 'jquery'

class Login extends Vue {
	public document = new DocumentMixin()
	public user = {
		usu_email: null,
		usu_senha: null
	}

    public base_url = process.env.VUE_APP_SERVER_URL

	public errors = {}

    public loading = false

    login(){
        $.ajax({
            type: "POST",
            url: this.base_url+"login",
            data: {data: this.user},
            beforeSend: () => {
                this.loading = true
            },
            complete: () => {
                this.loading = false
            },
            success: (json) => {
                if(json.errors != undefined){
                    this.errors = json.errors
                }

				if(json.access_token != undefined){
                    this.errors = {}
                    this.document.setAccessToken(json.access_token)

                    this.$router.push('/')
                }
            },
            dataType: 'json'
        })
    }

    clearErrors(event){
        $(event.target).removeClass('is-invalid')
    }
}

export default Login