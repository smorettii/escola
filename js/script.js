window.onload = async () => {
    //Version 2.5

    async function wait(ms) { return new Promise(result => setTimeout(result, ms)) }
    let meu_nome = ''
    function carregando() {
        document.querySelector("#progress-bar").classList.add("carregando")
    }
    function naocarregando() {
        document.querySelector("#progress-bar").classList.remove("carregando")
    }
    let mensagens_não_lidas = 0

    var userActive = false;

    function setUserActive() {
        userActive = true;
    }

    function checkUserActivity() {
        if (userActive) {
            userActive = false
        }
    }

    document.addEventListener("mousemove", setUserActive);
    document.addEventListener("keydown", setUserActive);
    document.addEventListener("scroll", setUserActive);

    setInterval(checkUserActivity, 5000);

    function entrou(nome) {
        const h1 = document.createElement('h1')
        h1.textContent = `${nome} Entrou no Chat!`
        h1.id = 'entrounochat'
        document.querySelector("#mensagens").appendChild(h1)
        rolarSuavementeParaBaixo()
    }

    let eu = {
        nome:null,
        cor: null
    }

    function pegar_senha(){
        if (localStorage.getItem('senha') !== null) {
            return localStorage.getItem('senha')
        }
        const senha = prompt('Digite sua senha')
        const salvar = confirm("Salvar senha?")
        if (salvar == true) {
            localStorage.setItem('senha', senha)
        }
        return senha
    }

    function gerar_class(){
        let letras = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPRSTUVWXYZ1234567890'.split("")
        let message = ''

        for (var i=0;i<=50;i++) {
            message = message + letras[Math.floor(Math.random()*letras.length)]
        }
        return message
    }

    let ws

    function mensagem(opcoes2) {
        const classe_mensagem = opcoes2.classe_mensagem
        const opcoes = opcoes2
        const div = document.createElement("div")
        div.id = 'outro'
        const nome = document.createElement('h1')
        nome.id = "nome"
        nome.textContent = opcoes.nome
        nome.style["color"] = opcoes.color

        nome.addEventListener("click", async () => {
            if (nomes_online.includes(opcoes.nome) == true) {
                const menu = document.querySelector("#menu_usuario_click")
                menu.style.display = 'block'

                let opcao_selecionada = ''

                menu.querySelectorAll("#opcao_menu").forEach(button => {
                    button.addEventListener("click", () => {
                        opcao_selecionada = button.getAttribute('alt') 
                    })
                })

                while (opcao_selecionada == '') {
                    await wait(10)
                }

                menu.style.display = 'none'

                if (opcao_selecionada == 'Sair') {
                    return 
                }

                if (opcao_selecionada == 'Excluir') {
                    const senha = pegar_senha()
                    if (senha == null || senha == '') {
                        return
                    }

                    ws.send(JSON.stringify({
                        type:'delete_message',
                        id: classe_mensagem,
                        password: senha
                    }))
                    return 
                }

                if (opcao_selecionada == 'Banir') {
                    const senha = pegar_senha()
                    if (senha == null || senha == '') {
                        return
                    }
                    ws.send(JSON.stringify({
                        type:"ban",
                        password: senha,
                        nome: nome.innerHTML.split(" -")[0]
                    }))
                    return
                }

                if (opcao_selecionada == 'Privado') {
                    const senha = prompt("Digite sua mensagem para "+nome.innerHTML.split(" -")[0]+":")
                    if (senha == null || senha == '') {
                        return
                    }

                    ws.send(JSON.stringify({
                        type: "message",
                        content: senha,
                        quem: nome.innerHTML.split(" -")[0],
                        nome:eu.nome,
                        color: eu.cor,
                        private: true
                    }))
                    return 
                }
            } else {
                alert("O usuário não está mais no servidor")
            }
        })
        nome.style.cursor = "pointer"

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

            if (opcoes.private == true) {
                nome.textContent = 'Você - Mensagem Privada'
                ultima.style.opacity = '0.7'
            }
        } else {
            mensagens_não_lidas += 1
            ultima.className = 'branco'
            div.style["justify-content"] = 'left'
            div.appendChild(nome)
            div.appendChild(content)
            if (opcoes.private == true) {
                nome.innerHTML = opcoes.nome+' - <strong style="color:black">Só você pode ler isso</strong>'
                ultima.style.opacity = '0.7'
            }
        }


        content.id = 'content'
        content.innerHTML = opcoes.content
        if (opcoes.content.includes("data:image/png;base64") == true) {
            let id_click_imagem = Math.floor(Math.random()*100000000)
            content.innerHTML = `<img style="margin-top:2px; cursor:pointer;" id="mensagemImagem" class="imagem_teste imagemClique${id_click_imagem}" src="${opcoes.content}">`
            setTimeout(()=>{
                document.querySelector("."+`imagemClique${id_click_imagem}`).addEventListener("click", () => {
                    const imagem = document.querySelector("."+`imagemClique${id_click_imagem}`);
                    if (imagem.classList.contains('expandido')) {
                        imagem.classList.remove('expandido');
                    } else {
                        imagem.classList.add('expandido');
                    }
                })
            }, 100)
        }

        ultima.id = 'mensagem_ativa'
        ultima.appendChild(div)
        ultima.classList.add(classe_mensagem)
        document.querySelector("#mensagens").appendChild(ultima)
        rolarSuavementeParaBaixo()
    }

    function saiu(nome) {
        if (banidos.includes(nome) == true) {
            banidos.splice(banidos.findIndex(v => v == nome), 1)
            return
        }
        const h1 = document.createElement('h1')
        h1.textContent = `${nome} Saiu do Chat!`
        h1.id = 'entrounochat'
        document.querySelector("#mensagens").appendChild(h1)
        rolarSuavementeParaBaixo()
    }
    let banidos = []

    function banir(nome) {
        const h1 = document.createElement('h1')
        h1.textContent = `${nome} Foi banido do chat!`
        h1.id = 'entrounochat'
        document.querySelector("#mensagens").appendChild(h1)
        rolarSuavementeParaBaixo()
        banidos.push(nome)
        if (nome == eu.nome) {
            alert("Você foi banido do chat!")
            window.location.reload()
        }
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
        let nome = document.querySelector("form").querySelector("input").value
        nome = nome.split(" ")
        if (nome.length > 2) {
            nome = `${nome[0]} ${nome[1]}`
        } else {
            nome = nome[0]
        }

        if (nomes_online.includes(nome) == true) {
            return alert("Esse nome ja está no servidor!")
        }
        if (nome.length <= 1) {
            naocarregando()
            return alert("O nome precisa ter no mínimo 2 caracteres!")
        }
        meu_nome = nome
        const cor = cores[Math.floor(Math.random() * cores.length)]

        eu.cor = cor 
        eu.nome = nome
        await wait(Math.random() * 1500)
        naocarregando()
        document.querySelector("#login").style.display = 'none'
        document.querySelector("#conversa").style.display = 'block'

        const aa = new WebSocket('wss://escolaapisamuel.squareweb.app') // new WebSocket('ws://localhost:80')
        ws = aa 

        let continuar = false
        ws.onopen = async () => {
            continuar = true
            await wait(1000)
            ws.send(JSON.stringify({
                type: 'enter',
                mensagem: `O usuário ${nome} entrou!`,
                nome: nome,
                cor: cor,
            }))
        }

        while (continuar == false) {
            await wait(1)
        }
        let typing_status = false

        ws.onerror = (error) => {
            console.log(error)
        }

        ws.onmessage = ({ data }) => {
            const body = JSON.parse(data)

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
            } else if (body.type == 'delete_message') {
                const procurar = document.querySelector(`.${body.id}`)

                if (procurar) {
                    procurar.querySelector("#content").innerHTML = `<span class="material-symbols-outlined">delete_forever</span>Mensagem excluida por um Administrador`
                    procurar.querySelector("#content").style['font-weight'] = '100'
                    procurar.style.opacity = '0.7'
                }
            } else if (body.type == 'ban') {
                banir(body.nome)
            }
        }

        ws.onclose = () => {
            alert("O WebSocket foi fechado, por isso iremos recarregar a sua pagina!")
            window.location.reload()
        }



        document.addEventListener('paste', function (event) {

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
                            color: cor,
                            private: false
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

            await ws.send(JSON.stringify({
                type: "message",
                content: mensagem,
                nome: nome,
                color: cor,
                private:false
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

    ; (async () => {
        while (true) {
            if (userActive == false) {
                if (mensagens_não_lidas > 0) {
                    document.title = `(${mensagens_não_lidas}) WAmuca`
                }
            } else {
                document.title = `WAmuca`
            }
            await wait(10)
        }
    })();
}
