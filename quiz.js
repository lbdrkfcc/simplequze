function quiz(options) {
    options = Object.assign({}, {
        element: '.quiz-form',
        intro: false,
        outro: false,
        restart: false,
        back: true,
        autoNext: false,
        divider: '/',
        onSubmit: undefined,
        callback: undefined
    }, options)

    //variables
    const FORM = document.querySelector(options.element)
    const BODY = FORM.querySelector('.quiz-body')
    const INTRO = FORM.querySelector('.quiz-intro')
    const OUTRO = FORM.querySelector('.quiz-outro')
    const PROGRESSBAR = FORM.querySelector('.quiz-progressbar>.progress')
    const PERCENT = FORM.querySelector('.quiz-percent')
    const COUNTER = FORM.querySelector('.quiz-counter')

    const BACK = FORM.querySelectorAll('.back')
    const START = FORM.querySelectorAll('.start')
    const NEXT = FORM.querySelectorAll('.next')
    const SUBMIT = FORM.querySelectorAll('.submit')
    const RESTART = FORM.querySelectorAll('.restart')

    const btnArray = [BACK,START,NEXT,SUBMIT,RESTART]

    let copyBODY = BODY.innerHTML
    let bodyChildren = BODY.children
    let currentQuestion = 0
    let lengthQuestions = BODY.children.length
    let percent = 0

    //helper functions
    function foreach(elem,callback){
        for(let el = 0;el < elem.length;el++){
            callback(elem[el])
        }
    }

    //functions
    function showBackNext(){
        if(options.back  && currentQuestion > 0){
            foreach(BACK,function(btn){
                btn.classList.remove('hide')
            })
        }else{
            foreach(BACK,function(btn){
                btn.classList.add('hide')
            })
        }
        foreach(NEXT,function(btn){
            btn.classList.remove('hide')
        })
    }
    function nextDisabled(dis = true){
        NEXT.disabled = dis;
        let inputs = bodyChildren[currentQuestion].querySelectorAll('input')
        let validArr = []
        foreach(inputs,function(el){
            if( el.checkValidity() ){
                validArr.push(true)
            }else{
                validArr.push(false)
            }
        })
        if( validArr.every(function(arg){ return arg === true }) ){
            foreach(NEXT,function(btn){
                btn.disabled = false;
            })
            foreach(SUBMIT,function(btn){
                btn.disabled = false;
            })
        }else{
            foreach(NEXT,function(btn){
                btn.disabled = true;
            })
            foreach(SUBMIT,function(btn){
                btn.disabled = true;
            })
        }
    }
    function formChecked(){
        let formInputs = BODY.querySelectorAll('input')
        foreach(formInputs,function(el){
            el.addEventListener('input',function(){
                if( el.checkValidity() ){
                    nextDisabled(false)
                }else{
                    nextDisabled()
                }
            })
        })
    }
    function autoNext(){
        let radios = BODY.querySelectorAll('input[type="radio"]')
        foreach(radios,function(el){
            el.addEventListener('input',function(){
                if(options.autoNext){
                    nextQuestion()
                }
            })
        })
    }
    function nextQuestion(){
        if(currentQuestion >= lengthQuestions-2){
            bodyChildren[currentQuestion].classList.add('hide')
            currentQuestion++
            bodyChildren[currentQuestion].classList.remove('hide')
            foreach(NEXT,function(btn){
                btn.classList.add('hide')
            })
            foreach(SUBMIT,function(btn){
                btn.classList.remove('hide')
            })
        }else{
            bodyChildren[currentQuestion].classList.add('hide')
            currentQuestion++
            bodyChildren[currentQuestion].classList.remove('hide')
            showBackNext()
            
        }
        nextDisabled()
        quizCounter()
    }
    function quizCounter(full = false){

        PROGRESSBAR.classList.remove('hide')
        PERCENT.classList.remove('hide')
        COUNTER.classList.remove('hide')

        COUNTER.innerHTML = (currentQuestion+1)+options.divider+lengthQuestions
        
        if(currentQuestion >= 0){
            percent = Math.floor(100/((lengthQuestions-1)/currentQuestion))
            if(percent >= 100){
                percent = 99
            }
        }
        PERCENT.innerHTML = percent+'%'
        PROGRESSBAR.style.width = percent+'%'
        if(full){
            PERCENT.innerHTML = '100%'
            PROGRESSBAR.style.width = '100%'
        }
    }
    function buttonsEventListener(){
        foreach(START,function(el){
            el.addEventListener('click',function(e){
                e.preventDefault()
                INTRO.classList.add('hide')
                bodyChildren[currentQuestion].classList.remove('hide')
                foreach(START,function(btn){
                    btn.classList.add('hide')
                })
                showBackNext()
                quizCounter()
            })
        })
        foreach(NEXT,function(el){
            el.addEventListener('click',function(e){
                e.preventDefault()
                nextQuestion()
            })
        })
        foreach(BACK,function(el){
            el.addEventListener('click',function(e){
                e.preventDefault()
                bodyChildren[currentQuestion].classList.add('hide')
                currentQuestion--
                bodyChildren[currentQuestion].classList.remove('hide')
                foreach(SUBMIT,function(btn){
                    btn.classList.add('hide')
                })

                showBackNext()
                quizCounter()
                nextDisabled(false)
            })
        })
        foreach(SUBMIT,function(el){
            el.addEventListener('click', async function(e){
                e.preventDefault()
                let formData = new FormData(FORM)

                function waiter(){
                    return new Promise(resolve => {
                        // setTimeout(()=> resolve(options.onSubmit(formData)), 2000)
                        resolve( options.onSubmit(formData) )
                    })
                }
                await waiter()
                // console.log('aaa')
                if(options.outro){
                    hideAll()
                    OUTRO.classList.remove('hide')
                }
                if(options.restart){
                    foreach(RESTART,function(btn){
                        btn.classList.remove('hide')
                    })
                }
                if(typeof options.callback === 'function'){
                    options.callback(formData);
                }
            })
        })
        foreach(RESTART,function(el){
            el.addEventListener('click',function(e){
                e.preventDefault()
                BODY.innerHTML = copyBODY
                currentQuestion = 0
                init()
            })
        })
    }
    function hideAll(){
        foreach(bodyChildren,function(el){
            el.classList.add('hide')
        })
        foreach(btnArray,function(btns){
            foreach(btns,function(btn){
                btn.classList.add('hide')
            })
        })
        INTRO.classList.add('hide')
        OUTRO.classList.add('hide')
        PROGRESSBAR.classList.add('hide')
        PERCENT.classList.add('hide')
        COUNTER.classList.add('hide')
    }
    function init(){
        percent = 0
        //hide quiz-body, buttons, into, outro
        hideAll()

        if(options.intro){
            INTRO.classList.remove('hide')
            foreach(START,function(btn){
                btn.classList.remove('hide')
            })
        }else{
            bodyChildren[currentQuestion].classList.remove('hide')
            showBackNext()
            quizCounter()
        }

        nextDisabled()
        formChecked()
        autoNext()
    }

    //programm
    buttonsEventListener()
    init()
}