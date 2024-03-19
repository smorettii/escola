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

        if (opcoes.content.includes("data:image/png;base64") == true) {
            content.innerHTML = `<img style="margin-top:2px" id="mensagemImagem" src="${opcoes.content}">`
        }

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

    let imagem_ = false

 

    document.querySelector("form").addEventListener("submit", async (a) => {
        a.preventDefault()
        carregando()
        const nome = document.querySelector("form").querySelector("input").value
        if (nomes_online.includes(nome) == true) {
            return alert("Esse nome ja está no servidor!")
        }
        if (nome.length <= 1) {
            naocarregando()
            return alert("O nome precisa ter no mínimo 2 caracteres!")
        }
        meu_nome = nome
        const cor = cores[Math.floor(Math.random() * cores.length)]
        await wait(Math.random() * 1500)
        naocarregando()
        document.querySelector("#login").style.display = 'none'
        document.querySelector("#conversa").style.display = 'block'

        const ws = new WebSocket('wss://escolaapisamuel.squareweb.app') //new WebSocket('ws://localhost:80')

        let continuar = false
        ws.onopen = () => {
            continuar = true
            ws.send(JSON.stringify({
                type: 'enter',
                mensagem: `O usuário ${nome} entrou!`,
                nome: nome,
                cor: cor
            }))
        }

        while (continuar == false) {
            await wait(1)
        }
        let typing_status = false
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
            } else if (body.type == 'typing') {
                const nome = body.nome
                const status = body.status
                typing_status = status
                if (status == true) {
                    document.querySelector("#digitando").textContent = status == true ? `${nome.split(" ")[0]} está digitando...` : ''
                    document.querySelector("#digitando").style.opacity = '1'
                } else {
                    document.querySelector("#digitando").style.opacity = '0'
                }

            }
        }

        ws.onclose = () => {
            //alert("O WebSocket foi fechado, por isso iremos recarregar a sua pagina!")
            //window.location.reload()
        }


 

        let enviando_imagem = false
        document.addEventListener('paste', function (event) {
            if (enviando_imagem == true) {
                return alert("Você ja está enviando uma imagem, aguarde...")
            }
            enviando_imagem = true
            var items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (index in items) {
                var item = items[index];
                if (item.kind === 'file') {
                    var blob = item.getAsFile();
                    var reader = new FileReader();
                    reader.onload = async function (event) {
                        var base64String = event.target.result;
                        let aleatorio = Math.floor(Math.random() * 1e6)
                        const a = document.createElement("div")
                        a.id = 'confirmarImagem'
                        a.innerHTML = `<h1>Deseja enviar essa imagem?</h1> <img src="${base64String}"> <div><button id="sim${aleatorio}">Sim</button> <button id="nao${aleatorio}">Não</button></div>`

                        document.body.appendChild(a)
                        let pode = null
                        document.querySelector("#sim" + aleatorio).addEventListener("click", () => {
                            pode = true
                        })
                        document.querySelector("#nao" + aleatorio).addEventListener("click", () => {
                            pode = false
                        })

                        while (pode == null) {
                            await wait(10)
                        }
                        enviando_imagem = false
                        document.body.removeChild(a)
                        if (pode == false) {
                            return
                        }


                        ws.send(JSON.stringify({
                            type: "message",
                            content: base64String,
                            nome: nome,
                            color: cor
                        }))
                    };
                    reader.readAsDataURL(blob);
                }
            }
        });

        document.querySelector("#onlines").addEventListener("click", () => {
            if (nomes_online.length == 0) {
                alert("O único online aqui é você!")
                return
            }

            alert("Pessoas online: " + nomes_online.join(", "))
        })

        document.querySelector("#enviar_input").addEventListener("submit", async (a) => {
            a.preventDefault()

            const mensagem = document.querySelector("#mensagem").value

            if (mensagem.length < 2) {
                alert("Sua mensagem tem que ter no mínimo 2 caracteres!")
                return
            }
            document.querySelector("#mensagem").value = ''



            console.log(mensagem)
            await ws.send(JSON.stringify({
                type: "message",
                content: mensagem,
                nome: nome,
                color: cor
            }))
        })

            ; (async () => {
                while (true) {
                    if (document.getElementById("mensagem").value.length > 1) {
                        ws.send(JSON.stringify({
                            type: "typing",
                            nome: nome,
                            status: true
                        }))
                        while (document.getElementById("mensagem").value.length > 1) {
                            if (typing_status == false) {
                                break
                            }
                            await wait(10)
                        }
                    } else if (document.getElementById("mensagem").value.length <= 1) {
                        ws.send(JSON.stringify({
                            type: "typing",
                            nome: nome,
                            status: false
                        }))
                        while (document.getElementById("mensagem").value.length <= 1) {
                            await wait(10)
                        }
                    }

                    await wait(10)
                }
            })();
    })
    function rolarSuavementeParaBaixo() {
        var div = document.getElementById("mensagens");
        div.scrollTop = div.scrollHeight;
        div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

}
