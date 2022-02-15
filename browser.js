fx.ns("fx", class Browser 
{
    constructor()
    {
        let browser;
        if (this.isChrome)
            browser = "chrome";
        else
        if (this.isIE)
            browser = "internet";
        else
        if (this.isFireFox)
            browser = "firefox";
        else
        if (this.isSafari)
            browser = "safari";
        else
        if (this.isOpera)
            browser = "opera";

        fx.dom.addClass("body", browser);

    }

    get isChrome()
    {
        if (this._isChrome === undefined)
            this._isChrome = navigator.userAgent.indexOf('Chrome') > -1;

        return this._isChrome
    }

    get isIE()
    {
        if (this._isIE === undefined)
            this._isIE = navigator.userAgent.indexOf('MSIE') > -1;

        return this._isIE;
    }

    get isFireFox()
    {
        if (this._isFireFox === undefined)
            this._isFireFox = navigator.userAgent.indexOf('Firefox') > -1;

        return this._isFireFox;
    }

    get isSafari()
    {
        if (this._isSafari === undefined)
            this._isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
        
        return this._isSafari;
    }

    get isOpera()
    {
        if (this._isOpera === undefined)
            this._isOpera = navigator.userAgent.toLowerCase().indexOf("op") > -1;
        
        return this._isOpera;
    }

    get OSName()
    {
        if (!this._OSName)
        {
            this._OSName="Unknown";
            if (navigator.appVersion.indexOf("Win")!=-1) this._OSName="Windows";
            if (navigator.appVersion.indexOf("Mac")!=-1) this._OSName="MacOS";
            if (navigator.appVersion.indexOf("X11")!=-1) this._OSName="UNIX";
            if (navigator.appVersion.indexOf("Linux")!=-1) this._OSName="Linux";
        }
        return this._OSName;
    }

    get isMac()
    {
        return this.OSName == "MacOS";
    }

    get device()
    {
        if (this.isTablet)
            return "tablet";
        if (this.isMobile)
            return "mobile";
        if (this.isTouchDevice)
            return "touchDevice";
        if (this.touchEnabled)
            return "touchEnabled";

        return "desktop";

    }

    get isMobile()
    {
        let a = navigator.userAgent||navigator.vendor||window.opera;
        return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)));

    }

    get isTablet()
    {
        return (this.isIOS && fx.graphics.screenSize().width >= 500) || 
                /ipad|tablet/i.test(navigator.userAgent) || 
                (this.isMobile && fx.graphics.screenSize().width >= 500);
    }

    get isIOS() 
    {
        if (/iPad|iPhone|iPod/.test(navigator.platform)) {
          return true;
        } else {
          return navigator.maxTouchPoints &&
            navigator.maxTouchPoints > 2 &&
            /MacIntel/.test(navigator.platform);
        }
    }

    get isTouchDevice() 
    {
        return !(/Win32/.test(navigator.platform)) && this.touchEnabled;
    }

    get touchEnabled()
    {
        return ('ontouchstart' in window) /* ||
           (navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints > 0)*/;
    }

    get urlPathParts()
    {
        return window.location.pathname.split("/").slice(2);
    }

    hashParameter(name, value, erase)
    {
        if (!this._hasParameters)
        {
            let parameters= window.location.hash.substr(1).split("&");
            this._hasParameters = {};
            for (let i = 0; i < parameters.length; i++)
            {
                let parameter = parameters[i].split("=");
                this._hasParameters[parameter[0]] = parameter[1];
            }
        }

        if (value)
        {
            if (erase)
                this._hasParameters = {};

            this._hasParameters[name] = value;

            let parameters = "#";
            for (let prop in this._hasParameters)
            {
                parameters += prop + "=" + this._hasParameters[prop] + "&"
            }

            parameters = parameters.slice(0, -1);

            parent.location.hash = parameters;
        }
        else
        if (name === false)
        {
            parent.location.hash = "";
        }

        return this._hasParameters[name];
    }
    

});