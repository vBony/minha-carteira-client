import { Options, Vue } from 'vue-class-component';
import DocumentMixin from '@/mixins/DocumentMixin'
import $ from 'jquery'
import Usuarios from '@/entities/Usuario';

class Cadastro extends Vue {
	public document = new DocumentMixin()
	
    public usuario = new Usuarios()
    public usuario_error = new Usuarios()

    public loading = false

	public errors = {}

    sendData(event){
		$.ajax({
            type: "POST",
            url: this.document.urlServer()+"user/register",
            data: {data:this.usuario},
            beforeSend: () => {
                this.loading = true
            },
            complete: () => {
                this.loading = false
            },
            success: (json) => {
                if(json.errors != undefined){
                    this.usuario_error = json.errors
                }else{
                    if(json.access_token != undefined){
                        this.document.setAccessToken(json.access_token)
                        this.$router.replace('/')
                    }else{
                        alert('Houve um problema na requisição. Tente novamente mais tarde!')
                    }
                }
            },
            dataType: 'json'
        });
    }

    clearErrors(event){
        $(event.target).removeClass('is-invalid')
    }
}

export default Cadastro