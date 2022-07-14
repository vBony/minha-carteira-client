import { Options, Vue } from 'vue-class-component';
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
    Header
  },
})

class Home extends Vue {
	public dm = new DocumentMixin()

    public loading = false

    public loadingFullModalTransacao = false
    public loadingModalTransacao = false

    public loadingModalSituacao = false

    public toast = new Toast()
    public alterandoTransacao = false

    public access_token = this.dm.getAccessToken() != null ? this.dm.getAccessToken() : null
    public user = {}
    public mesanos = {
        mes_ano: '',
        prox_mesano: null,
        ant_mesano: null
    }
    public resumo = {}
    public tipoModalTransacao = 0
    public tipoModalSituacao = 0

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
            data: {access_token: this.dm.getAccessToken()},
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
                    $('#datePicker').val(this.mesanos.mes_ano)

                    this.user = json.data.user
                    this.resumo = json.data.resumo
                    if(json.data.transacoes != null){
                        this.transacoes = json.data.transacoes
                    }
                    
                }
            },
            error: () => {
                // this.$router.push('/login')
            },
            dataType: 'json'
        });
    }

    editarTransacao(tipo, alterando, index){
        this.transacao = new Transacoes()

        // buscando categorias
        this.loading = true
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

        if(!alterando){
            this.loading = false
            this.transacao.tra_data = this.dataAtual();
            $('#valor_transacao').val('')
        }

        if(alterando && index != null){
            this.alterandoTransacao = true

            /**
             * Passando a transacao selecionada para uma variavel separada, 
             * para não alterar o valor na listagem.
             */
            const transacao = this.transacoes[index]

            // buscando transacao para alterar
            $.ajax({
                type: "POST",
                url: this.dm.urlServer()+"dashboard/buscar-transacao",
                data: {
                    id: transacao.tra_id,
                    access_token: this.dm.getAccessToken(),
                    mesano: this.mesanos.mes_ano
                },
                complete: () => {
                    this.loading = false
                },
                success: (json) => {
                    if(json.transacao){
                        this.transacao = json.transacao
                        $('#valor_transacao').val(json.transacao.tra_valor)

                        this.transacao.tra_situacao = this.transacao.tra_situacao == 0 ? false : true
                        $('#tra_situacao').prop('checked', this.transacao.tra_situacao)
                        console.log(this.transacao);
                        
                    }
                },
                dataType: 'json'
            });
        }

        this.transacao.tra_tipo = tipo
        this.tipoModalTransacao = tipo
        this.transacao_error = new Transacoes()
    }

    salvarTransacao(){
        const checkboxSituacao = $('#tra_situacao').prop('checked');
        this.transacao.tra_situacao = checkboxSituacao
        

        $.ajax({
            type: "POST",
            url: this.dm.urlServer()+"dashboard/inserir-transacao",
            data: {
                data: this.transacao,
                access_token: this.dm.getAccessToken(),
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
                    this.transacao = new Transacoes()

                    if(this.alterandoTransacao){
                        this.showToast('Transação editada com sucesso!', 3000, 'bg-success', 'text-white', 'fa-check-circle')
                    }else{
                        this.showToast('Transação incluída com sucesso!', 3000, 'bg-success', 'text-white', 'fa-check-circle')
                    }
                    
                    this.closeModal('btn-close-transacao-modal')
                }
            },
            dataType: 'json'
        });
    }

    proxMesAno(){
        this.getTransacoesMesAno(this.mesanos.prox_mesano)
    }

    antMesAno(){
        this.getTransacoesMesAno(this.mesanos.ant_mesano)
    }

    getTransacoesMesAno(mesano){
        // eslint-disable-next-line
        const mesanoinput:any = $('#datePicker').val()
        this.mesanos.mes_ano = mesanoinput

        $.ajax({
            type: "POST",
            url: this.dm.urlServer()+"dashboard/buscar-mesano",
            data: {
                access_token: this.dm.getAccessToken(),
                mesano: mesano != null ? mesano : this.mesanos.mes_ano
            },
            beforeSend: () => {
                this.loading = true
            },
            complete: () => {
                this.loading = false
            },
            success: (json) => {
                if(json.errors != undefined){
                    this.transacao_error = json.errors
                }else{
                    if(json.access_token != undefined){
                        this.dm.setAccessToken(json.access_token)
                        this.access_token = this.dm.getAccessToken()
                    }
                    
                    this.mesanos = json.mesanos
                    $('#datePicker').val(this.mesanos.mes_ano)

                    this.transacoes = json.transacoes
                    this.resumo = json.resumo
                }
            },
            error: () => {
                // this.$router.replace('/login')
            },
            dataType: 'json'
        });
    }

    efetivarTransacao(tipo, id, index){
        this.transacao = this.transacoes[index]
        this.tipoModalSituacao = tipo
    }

    enviarEfetivacaoTransacao(){
        $.ajax({
            type: "POST",
            url: this.dm.urlServer()+"dashboard/efetivar-transacao",
            data: {
                id: this.transacao.tra_id,
                access_token: this.dm.getAccessToken(),
                mesano: this.mesanos.mes_ano
            },
            beforeSend: () => {
                this.loading = true
            },
            complete: () => {
                this.loading = false
            },
            success: (json) => {
                if(json.access_token){
                    this.transacoes = json.transacoes
                    this.dm.setAccessToken(json.access_token)
                    this.resumo = json.resumo

                    this.showToast('Transação efetivada com sucesso!', 3000, 'bg-success', 'text-white', 'fa-check-circle')
                    this.closeModal('btn-close-situacao')
                }
            },
            error: () => {
                // this.$router.replace('/login')
            },
            dataType: 'json'
        });
    }

    modalDeletarTransacao(index){
        this.transacao = this.transacoes[index]
    }

    deletarTransacao(){
        $.ajax({
            type: "POST",
            url: this.dm.urlServer()+"dashboard/deletar-transacao",
            data: {
                id: this.transacao.tra_id,
                access_token: this.dm.getAccessToken(),
                mesano: this.mesanos.mes_ano
            },
            beforeSend: () => {
                this.loading = true
            },
            complete: () => {
                this.loading = false
            },
            success: (json) => {
                if(json.access_token){
                    this.transacoes = json.transacoes
                    this.dm.setAccessToken(json.access_token)
                    this.resumo = json.resumo

                    this.showToast('Transação deletada com sucesso!', 3000, 'bg-success', 'text-white', 'fa-check-circle')
                    this.closeModal('btn-close-modal-deletar-transacao')
                }
            },
            error: () => {
                // this.$router.replace('/login')
            },
            dataType: 'json'
        })
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
            this.toast.show = 'hide'
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