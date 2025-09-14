
class ToggleButton{
    successCallback=[]
    constructor({
        apiString,
        yesButtonHtml,
        noButtonHtml,
        yesButtonElement,
        noButtonElement,
        successStatus,
        failedStatus,
        toggleLogicFunction,
        initialLogicFunction,
        styles
    }){
        if(isValidUrl(apiString)){
            this.toggleApi = apiString;
        }
        else{
            console.error('apiString is expected as valid url string');
            return ;
        }
        if(typeof yesButtonHtml == 'string'){
            this.yesButton = isValidHTML(yesButtonHtml);
        }
        if(typeof noButtonHtml == 'string'){
            this.noButton = isValidHTML(noButtonHtml);
        }
        if(typeof toggleLogicFunction == 'function'){
            this.apiCallback = toggleLogicFunction;
        }
        if(typeof initialLogicFunction == 'function'){
            this.initialLogicFunction = initialLogicFunction;
        }
        if(yesButtonElement instanceof HTMLElement){
            this.yesButton = yesButtonElement;
        }
        if(noButtonElement instanceof HTMLElement){
            this.noButton = noButtonElement;
        }
        if(typeof successStatus == 'string'){
            this.successStatus = isValidHTML(successStatus);
        }
        if(typeof failedStatus == 'string'){
            this.failedStatus = isValidHTML(failedStatus);
        }
        if(styles){
            this.additionalStyle = styles;
        }
        if(!this.yesButton||!this.noButton||!this.initialLogicFunction||!this.apiCallback){
            return Error('invalid parameters passed');
        }
        this._render();
    }
    _render(){
        this.wrapper = this.handleStyle();
        this.wrapper.classList.add('toggleApiButton');
        const btnContainer = document.createElement('button');
        this.handleClick = this.handleClick.bind(this);
        btnContainer.addEventListener('click',this.handleClick);

        if(this.yesButton){
            btnContainer.appendChild(this.yesButton);
            this.yesButton.classList.add('hide');
        }
        else{
            
        }
        if(this.noButton){
            btnContainer.appendChild(this.noButton);
            this.noButton.classList.add('hide');
        }
        else{

        }
        this.wrapper.appendChild(btnContainer);

        const statusContainer = document.createElement('div');
        statusContainer.classList.add('status');

        const loadingStatus = document.createElement('div');
        loadingStatus.classList.add('loader','hide');

        statusContainer.appendChild(loadingStatus);

        if(this.successStatus){
            statusContainer.appendChild(this.successStatus);
            this.successStatus.classList.add('success','hide');
        }
        else{

        }

        if(this.failedStatus){
            statusContainer.appendChild(this.failedStatus);
            this.failedStatus.classList.add('failed','hide');
        }
        else{

        }

        this.wrapper.appendChild(statusContainer);
        this.renderLogic();
    }
    handleStyle() {
        const wrapper = document.createElement('div');
        
        const style = document.createElement('style');
        style.textContent = `
            .apiToggleButton {
                
            }
            .hide {
                display: none;
            }
            .status{
                display: inline-block;
            }
            .hide .success,.hide .failed{
                display: block;
                opacity: 0;
            }
            .success{
                opacity: 1;
            }
            .failed{
                opacity: 1;
            }
            .loader {
                border: 4px solid #1262af;
                border-left-color: white;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% {
                    transform: rotate(0deg);
                }

                100% {
                    transform: rotate(360deg);
                }
            }
        `;
        style.textContent += this.additionalStyle;

        wrapper.appendChild(style);

        // const componentDOM = /* all previous DOM from before */;
        // wrapper.appendChild(componentDOM);

        return wrapper;
    }
    async handleClick(){
        const loadingStatus = this.wrapper.querySelector('.loader');
        const button = this.wrapper.querySelector('button');

        try{
            loadingStatus.classList.remove('hide');
            button.disabled = true;
            await fetch(this.toggleApi)
            .then(res => res.json())
            .then((data) => {
                if(this.apiCallback(data)){
                    this.showSuccess(loadingStatus,button);
                    this.onSuccess();
                }
                else{
                    this.showFailed(loadingStatus,button);
                }
            })
        }catch(err){
            this.showFailed(loadingStatus,button);
        }
    }
    async renderLogic(){
        await this.initialLogicFunction()
        .then(showYes => {
                if(showYes){
                    this.yesButton.classList.remove('hide');
                }
                else{
                    this.noButton.classList.remove('hide');
                }
            }
        )
    }
    showSuccess(loadingStatus,button){
        loadingStatus.classList.add('hide');
        this.yesButton.classList.toggle('hide');
        this.noButton.classList.toggle('hide');
        this.successStatus.classList.remove('hide');
        setTimeout(() => {
            button.disabled = false;
            this.successStatus.classList.add('hide');
        },2500);
    }
    showFailed(loadingStatus,button){
        loadingStatus.classList.add('hide');
        this.failedStatus.classList.remove('hide');
        setTimeout(() => {
            button.disabled = false;
            this.failedStatus.classList.add('hide');
        },2500);
    }
    showYes(){
        this.yesButton.classList.remove('hide');
        this.noButton.classList.add('hide');
    }
    showNo(){
        this.noButton.classList.remove('hide');
        this.yesButton.classList.add('hide');
    }
    onSuccess(){
        this.successCallback.forEach(cb => cb());
    }
}