import { Negociaçoes } from "../models/negociaçoes.js";
import { Negociaçao } from "../models/negociaçao.js";
import { NegociaçoesView } from "../views/negociaçoes-view.js";
import { MensagemView } from "../views/mensagen-view.js";
import { LogarTempoDeExecução } from "../decorators/logar-tempo-de-execução.js";
import { Inspect } from "../decorators/inspect.js";
import { domInject } from "../decorators/domInject.js";
import { NegociaçoesDoDia } from "../interface/negociações-do-dia.js";

export class NegociaçaoController {

    @domInject('#data')
    private inputData: HTMLInputElement;
    @domInject('#quantidade')
    private inputQuantidade: HTMLInputElement;
    @domInject('#valor')
    private inputValor: HTMLInputElement;

    private negociaçoes = new Negociaçoes();
    private NegociaçaoViwer = new NegociaçoesView('#negociaçoes-view');
    private MensagemViwer = new MensagemView('#mensagemView');
    private readonly diasUteis: number[] = [1, 2, 3, 4, 5];

    constructor() {
        this.NegociaçaoViwer.update(this.negociaçoes);
    }

    @Inspect()
    @LogarTempoDeExecução()
    public Adiciona(): void{
        const negociaçao = Negociaçao.Criar(
            this.inputData.value, 
            this.inputQuantidade.value, 
            this.inputValor.value
        )

        const diaDaSemana = negociaçao.data.getDay();

        if(this.diasUteis.includes(diaDaSemana)){
            this.negociaçoes.Adicionar(negociaçao);
            this.LimparFormulario();
            this.AtualizaView();
        } else {
            this.MensagemViwer.update('Só é possivel realizar Negociações em dias uteis.');
        }

        setInterval(() => {this.MensagemViwer.AlertOff();}, 8000);
    }

    public LimparLista(): void{
        this.NegociaçaoViwer.reset();
        this.negociaçoes.Reset();
    }

    public importData(): void {
        fetch('http://localhost:8080/dados')
            .then(res => res.json())
            .then((dados: NegociaçoesDoDia[]) => {
                return dados.map(dadosDeHoje => {
                    return new Negociaçao(
                        new Date(),
                        dadosDeHoje.montante,
                        dadosDeHoje.vezes
                    )
                })
            })
            .then(negociaçaoDeHoje => {
                for(let negociaçao of negociaçaoDeHoje){
                    this.negociaçoes.Adicionar(negociaçao);
                }
                this.NegociaçaoViwer.update(this.negociaçoes);
            })

    }

    private LimparFormulario(): void{
        this.inputData.value = '';
        this.inputQuantidade.value = '';
        this.inputValor.value = '';
        this.inputData.focus();
    }

    private AtualizaView(): void {
        this.NegociaçaoViwer.update(this.negociaçoes);
        this.MensagemViwer.update("Negociação Registrada com Sucesso!!");
    } 
}