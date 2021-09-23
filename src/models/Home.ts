import { Options, Vue } from 'vue-class-component';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import DocumentMixin from '@/mixins/DocumentMixin'
import Header from '@/components/Header.vue';
import $ from 'jquery'
import 'jquery-mask-plugin'
import Transacoes from '@/entities/Transacoes';
import Toast from '@/entities/Toast';
// import bootstrap from 'bootstrap'

// Importando componentes
@Options({
  components: {
    HelloWorld,
    Header
  },
})

class Home extends Vue {
	public dm = new DocumentMixin()
    public loading = false
    public loadingModalTransacao = false
    public toast = new Toast()

    public access_token = this.dm.getAccessToken() != null ? this.dm.getAccessToken() : null
    public user = {}
    public mesanos = {
        mes_ano: null,
        prox_mesano: null,
        ant_mesano: null
    }
    public resumo = {}
    public tipoModalTransacao = 0

    public transacao = new Transacoes()
    public transacao_error = new Transacoes()

    public categorias = {}
    public transacoes = {}


    created(){
        window.document.title = '📊 Dashboard - Minha carteira'
        this.fetchInitialData()
    }

    mounted(){
        this.initSystem()
    }

	public errors = {}

    fetchInitialData(){
        $.ajax({
            type: "POST",
            url: this.dm.urlServer()+"dashboard",
            data: {access_token: this.access_token},
            beforeSend: () => {
                this.loading = true
            },
            complete: () => {
                this.loading = false
            },
            success: (json) => {
				if(json.data != undefined){
                    this.access_token = json.data.access_token
                    this.mesanos = json.data.mesanos
                    this.user = json.data.user
                    this.resumo = json.data.resumo
                    if(json.data.transacoes != null){
                        this.transacoes = json.data.transacoes
                    }
                    
                }
            },
            error: () => {
                this.$router.push('/login')
            },
            dataType: 'json'
        });
    }

    editarTransacao(tipo, alterando){
        if(!alterando){
            this.transacao = new Transacoes()
            this.transacao.tra_data = this.dataAtual();
            $('#valor_transacao').val('')
        }

        this.transacao.tra_tipo = tipo
        this.tipoModalTransacao = tipo
        this.transacao_error = new Transacoes()

        // buscando categorias
        $.ajax({
            type: "POST",
            url: this.dm.urlServer()+"dashboard/categorias",
            data: {tipo: tipo},
            success: (json) => {
                if(json.categorias != undefined){
                    this.categorias = json.categorias
                }
            },
            dataType: 'json'
        });
    }

    salvarTransacao(){
        $.ajax({
            type: "POST",
            url: this.dm.urlServer()+"dashboard/inserir-transacao",
            data: {
                data: this.transacao,
                access_token: this.access_token,
                mesano: this.mesanos.mes_ano
            },
            beforeSend: () => {
                this.loadingModalTransacao = true
            },
            complete: () => {
                this.loadingModalTransacao = false
            },
            success: (json) => {
                if(json.errors != undefined){
                    this.transacao_error = json.errors
                }else{
                    if(json.access_token != undefined){
                        this.dm.setAccessToken(json.access_token)
                        this.access_token = this.dm.getAccessToken()
                    }

                    this.transacoes = json.transacoes
                    this.resumo = json.resumo
                    this.showToast('Transação incluída com sucesso!', 3000, 'bg-success', 'text-white', 'fa-check-circle')
                    this.closeModal('btn-close-transacao-modal')
                }
            },
            dataType: 'json'
        });
    }

    initSystem(){
        $('#datePicker').mask('00-0000')
        $('#valor_transacao').mask("#.##0,00", {reverse: true});
    }

    scrollHandleTransacoes(event){
        const scrollTop = event.target.scrollTop;

        $("#theadTransacoes").css({
            'transform': `translateY(${scrollTop}px)`,
            'box-shadow': 'black 0px 0.3px 0px 0px'
        })
        
    }

    setValor(){
        this.transacao.tra_valor = $('#valor_transacao').val()
        console.log('valor inserido: ', this.transacao.tra_valor);
    }

    closeModal(id){
        $(`#${id}`).trigger('click')
    }

    clearErrors(event){
        if($(event.target).hasClass('is-invalid')){
            $(event.target).removeClass('is-invalid')
        }
    }

    showToast(msg:string, time:number, bg_color:string, font_color:string, icon:string){
		this.toast.bg_color = bg_color
		this.toast.font_color = font_color,
		this.toast.icon = icon
        this.toast.msg = msg
        this.toast.show = 'show'

        setTimeout(() => {
            this.toast.show = ''
        }, time); 
    }

    dataAtual(){
        const data = new Date()

        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();

        return `${ano}-${mes}-${dia}`
    }
}

export default Home