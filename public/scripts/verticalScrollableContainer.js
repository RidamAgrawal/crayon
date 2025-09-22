
class verticalScroller{
    constructor({
        getCards,
        styles
    }){
        if(typeof getCards == 'function'){
            this.getCards = getCards;
        }
        else{
            throw Error('getCards must be a function returning appropriate HTML element');
        }
        if(typeof styles == 'string' && isValidCSS2(styles)){
            this.additionalStyle = styles;
        }
        else{
            throw Error('styles must be an appropriate CSS styles');
        }
        this._render();
    }
    _render(){
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('verticalScrollerComponent');
        
        this.shadowWrapper = this.wrapper.attachShadow({mode: "closed"});
        this.shadowWrapper.adoptedStyleSheets = this.handleStyle();

        const svgNS = "http://www.w3.org/2000/svg";
        const emptyIcon = document.createElementNS(svgNS,'svg');
        emptyIcon.classList.add('emptyIcon');

        // Set SVG attributes
        emptyIcon.setAttribute("xmlns", svgNS);
        emptyIcon.setAttribute("viewBox", "0 -960 960 960");
        // Create the path element in SVG namespace
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", "M200-640v440h560v-440H640v320l-160-80-160 80v-320H200Zm0 520q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v499q0 33-23.5 56.5T760-120H200Zm16-600h528l-34-40H250l-34 40Zm184 80v190l80-40 80 40v-190H400Zm-200 0h560-560Z");

        // Append path to SVG, and SVG to container
        emptyIcon.appendChild(path);
        this.shadowWrapper.appendChild(emptyIcon);

        const actionButton = document.createElement('button');
        actionButton.classList.add('verticalScrollerButton');
        actionButton.addEventListener('click',this.addNextCard.bind(this));

        const loadingStatus = document.createElement('div');
        loadingStatus.classList.add('loader','hide');

        actionButton.appendChild(loadingStatus);

        const showMoreContent = document.createElement('div');
        showMoreContent.classList.add('showMoreContent','hide');
        
        const showMoreLabel = document.createElement('span');
        showMoreLabel.textContent = 'Show More';
        showMoreContent.appendChild(showMoreLabel);

        const dropdownIcon = document.createElementNS(svgNS,'svg');
        dropdownIcon.classList.add('showMoreDropdownIcon');

        // Set SVG attributes
        dropdownIcon.setAttribute("xmlns", svgNS);
        dropdownIcon.setAttribute("viewBox", "0 0 7 5");
        // Create the path element in SVG namespace
        const dropdownIconPath = document.createElementNS(svgNS, "path");
        dropdownIconPath.setAttribute("d", "M6.4502 0.525098L3.5002 3.4751L0.550195 0.525097");

        // Append path to SVG, and SVG to container
        dropdownIcon.appendChild(dropdownIconPath);
        showMoreContent.appendChild(dropdownIcon);

        actionButton.appendChild(showMoreContent);

        const noMoreContent = document.createElement('div');
        noMoreContent.classList.add('noMoreContent','hide');

        noMoreContent.textContent = 'no more to show';

        actionButton.appendChild(noMoreContent);
        this.shadowWrapper.appendChild(actionButton);
        this.addNextCard();
    }
    handleStyle() {
        let textContent = `
            .hide {
                display: none;
            }
            .verticalScrollerButtonContent{
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
                fill: none;
            }
            .verticalScrollerButton{
                width: 100%;
                margin-top: 4px;
                padding: 10px;
                border-radius: 4px;
                background-color: rgba(18, 98, 175, 0.1);
                border: none;
                font-family: 'Roboto', sans-serif;
                color: #1262af;
                box-sizing: border-box;
                text-align: center;
                display: flex;
                justify-content: center;
            }
            [disabled].verticalScrollerButton{
                background-color: #1262af;
                color: white;
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
            .showMoreDropdownIcon{
                height: 8px;
                width: 8px;
                stroke: #1262af;
                stroke-linecap: round;
                fill: none;
            }
            svg.emptyIcon{
                fill: #1262af1a;
                stroke-linecap: round;
            }
        `;
        Object.assign(this.wrapper.style,{
                display: 'flex',
                'flex-direction': 'column',
                'align-items': 'center', 
                'overflow-y': 'scroll',
                'max-height': '370px',
                width: '100%',
                border: '1px solid #cecece',
                'box-shadow': '0px 2px 3px rgba(0, 0, 0, 0.2)',
                'border-radius': '4px',
                'scrollbar-width':'none'
            });
        if(isValidCSS2(this.additionalStyle)){
            textContent = this.additionalStyle + textContent;
        }
        const stylesheet = new CSSStyleSheet();
        stylesheet.replaceSync(textContent);
        return [stylesheet];
    }
    async addNextCard(){
        try{
            if(!this.failed){
                this.showLoader();
                const actionButton = this.shadowWrapper.querySelector('.verticalScrollerButton');
                actionButton.disabled = true;
                const cards = await this.getCards();
                if(Array.isArray(cards) && cards.length > 0 && cards[0] instanceof HTMLElement){
                    cards.forEach((card) => this.shadowWrapper.insertBefore(card,actionButton));
                    this.hideLoader();
                    this.hideEmpty();
                    actionButton.disabled = false;
                }else{
                    this.failed = true;
                    this.hideLoader();
                    this.showFailed();
                }
            }
        }catch(error){
            this.showFailed();
        }
    }
    showLoader(){
        const loader = this.shadowWrapper.querySelector('.loader');
        const showMore = this.shadowWrapper.querySelector('.showMoreContent');
        loader.classList.remove('hide');
        showMore.classList.add('hide');
    }
    hideLoader(){
        const loader = this.shadowWrapper.querySelector('.loader');
        const showMore = this.shadowWrapper.querySelector('.showMoreContent');
        loader.classList.add('hide');
        showMore.classList.remove('hide');
    }
    showFailed(){
        const showMore = this.shadowWrapper.querySelector('.showMoreContent');
        const fetchFailed = this.shadowWrapper.querySelector('.noMoreContent');
        showMore.classList.add('hide');
        fetchFailed.classList.remove('hide');
    }
    hideEmpty(){
        const emptyIcon = this.shadowWrapper.querySelector('.emptyIcon');
        emptyIcon.classList.add('hide');
    }
    showEmpty(){
        const emptyIcon = this.shadowWrapper.querySelector('.emptyIcon');
        emptyIcon.classList.remove('hide');
    }
}