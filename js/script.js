window.onload = async () => {
    async function wait(ms) { return new Promise(result => setTimeout(result, ms)) }
    let meu_nome = ''
    function carregando() {
        document.querySelector("#progress-bar").classList.add("carregando")
    }
    function naocarregando() {
        document.querySelector("#progress-bar").classList.remove("carregando")
    }

    function entrou(nome) {
        const h1 = document.createElement('h1')
        h1.textContent = `${nome} Entrou no Chat!`
        h1.id = 'entrounochat'
        document.querySelector("#mensagens").appendChild(h1)
        rolarSuavementeParaBaixo()
    }

    function mensagem(opcoes) {
        console.log(opcoes)

        const div = document.createElement("div")
        div.id = 'outro'
        const nome = document.createElement('h1')
        nome.id = "nome"
        nome.textContent = opcoes.nome
        nome.style["color"] = opcoes.color
        const content = document.createElement('h1')
        const ultima = document.createElement('ultima')
        if (opcoes.nome == meu_nome) {
            ultima.className = 'verde'
            div.style["justify-content"] = 'right'
            ultima.style["margin-left"] = '50%'
            div.appendChild(nome)
            div.appendChild(content)
            nome.textContent = 'Você'
            content.className = 'semmargin'
        } else {
            ultima.className = 'branco'
            div.style["justify-content"] = 'left'
            div.appendChild(nome)
            div.appendChild(content)
            
        }

        
        content.id = 'content'
        content.innerHTML = opcoes.content



        ultima.id = 'mensagem_ativa'
        ultima.appendChild(div)

        document.querySelector("#mensagens").appendChild(ultima)
        rolarSuavementeParaBaixo()
    }

    function saiu(nome) {
        const h1 = document.createElement('h1')
        h1.textContent = `${nome} Saiu do Chat!`
        h1.id = 'entrounochat'
        document.querySelector("#mensagens").appendChild(h1)
        rolarSuavementeParaBaixo()
    }

    let nomes_online = []

    const cores = [
        "cadetblue",
        "darkgoldenrod",
        "cornflowerblue",
        "darkkhaki",
        "hotpink",
        "gold"
    ]
    document.querySelector("form").addEventListener("submit", async (a) => {
        a.preventDefault()
        carregando()
        const nome = document.querySelector("form").querySelector("input").value
        if (nome.length <= 2) {
            naocarregando()
            return alert("O nome precisa ter no mínimo 3 caracteres!")
        }
        meu_nome = nome
        const cor = cores[Math.floor(Math.random() * cores.length)]
        await wait(Math.random() * 1500)
        naocarregando()
        document.querySelector("#login").style.display = 'none'
        document.querySelector("#conversa").style.display = 'block'

        const ws = new WebSocket('wss://escolaapisamuel.squareweb.app') //new WebSocket('ws://localhost:80')

        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: 'enter',
                mensagem: `O usuário ${nome} entrou!`,
                nome: nome,
                cor: cor
            }))
        }

        ws.onmessage = ({ data }) => {
            const body = JSON.parse(data)

            console.log(body)
            if (body.type == 'enter') {
                const nome = body.nome

                entrou(nome)
            } else if (body.type == 'leave') {
                const nome = body.nome

                saiu(nome)
            } else if (body.type == 'online') {
                const quantidade = body.onlines
                nomes_online = body.nomes
                document.querySelector("#onlines").innerHTML = quantidade == 1 ? `${quantidade} Online` : `${quantidade} Onlines`
            } else if (body.type == 'message') {
                mensagem(body)
            }
        }


        document.querySelector("#enviar_input").addEventListener("submit", async (a) => {
            a.preventDefault()

            const mensagem = document.querySelector("#mensagem").value
            document.querySelector("#mensagem").value = ''

            console.log(mensagem)
            await ws.send(JSON.stringify({
                type: "message",
                content: mensagem,
                nome: nome,
                color: cor
            }))
        })
    })
    function rolarSuavementeParaBaixo() {
        var div = document.getElementById("mensagens");
        div.scrollTop = div.scrollHeight; 
        div.scrollIntoView({ behavior: 'smooth', block: 'end' });  
    }

}
