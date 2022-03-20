var GazeCloudAPI = new function GazeCloudAPIInit() {
        this.APIKey = "AppKeyDemo";
        //////Callback//////
        this.oFullScreen = false;
        this.oCalibrationData = null;
        this.CalibrationType = 1;
        this.UseClickRecalibration = true;
        this.OnResult = null;
        this.OnCalibrationComplete = null;
        this.OnCalibrationFail = null;
        this.OnStopGazeFlow = null;
        this.OnCamDenied = null;
        this.OnError = null;
        this.ShowCalibration = ShowCalibration;
        this.OnGazeEvent = null;
        this.StartEyeTracking = function(ServerUrl = "", Port = -1) {

            if (ServerUrl != "") {
                ForeceCloudServerAdress = true;
                GazeCloudServerAdress = ServerUrl;
                if (Port > 0)
                    GazeCloudServerPort = Port;
                StartGazeFlow();
            } else {
                if (!GetCloudAdressReady) {
                    _WaitForGetCloudAdress = setInterval(() => {
                        clearInterval(_WaitForGetCloudAdress);
                        if (!GetCloudAdressReady)
                            if (Logg) Logg("GetCloudAdress too long", 2);
                        StartGazeFlow();
                    }, 2000);
                } else {
                    StartGazeFlow();
                }
            }
        }
        this.StopEyeTracking = function() {
            StopGazeFlow();
        }
        this.RestartEyeTracking = function() {
            StopGazeFlow();
            StartGazeFlow();
            if (Logg) Logg("RestartEyeTracking", 2);
        }

        this.GetSessionId = function() {
            return GazeFlowSesionID;
        }

        //////Callback//////
        function SendBinary(s) {
            var uint8array = new TextEncoder("utf-8").encode(s);
            ws.send(uint8array);
        }

        //-----------------
        this.AddIFrameEvent = function(event) {
                //df
                try {
                    if (stopFn != null) {
                        StopWebRec();
                    }
                    eventsWebRec.push(event);
                } catch (e) {}
            }
            //-----------------
        let eventsWebRec = [];
        var bStopR = false;
        var WebRecFinished = false;

        function StopWebRec() {
            bStopR = true;
            if (stopFn != null) {
                stopFn();
            }
        }
        let stopFn = null;

        /////////////////endwebrc/////////////////
        ////////////////////////HtmlGUI/////////////////////////
        var _GuiHtml = '<div id="CamAccessid" style="height:100%; width:100%; left: 0px; position: fixed; top: 0%;display:none;opacity: 0.8; background-color: black;z-index: 9999;" > <h1 align="center" style="color: white;">Please, Allow Camera Access</h1> </div> <div id="errid" style="height:100%; width:100%; left: 0px; position: fixed; top: 0%;display:none;opacity: 0.9; background-color: black;z-index: 99999;" > <h1 id="errmsgid" align="center" style="color: white;">Err</h1>    <p align="center"> <button class= "buttonRecalibrate" onclick=" GazeCloudAPI.RestartEyeTracking();"  type="button">Try again</button> </p>  </div> <div id="loadid" style="height:100%; width:100%; left: 0px; position: fixed; top: 0%;display:none;opacity: 0.93; background-color: black;z-index: 9999;" > <h1 align="center" style="color: white;"> Loading...</h1> <div class="loader"></div> </div> <div id="demoid" style="height:100%; width:100%; left: 0px; position: fixed; top: 0%;display:none;opacity: 0.8; background-color: black;z-index: 9999;" > <h1 align="center" style="color: white;">You have reached demo time limit</h1> </div> <div id="waitslotid" style="height:100%; width:100%; left: 0px; position: fixed; top: 0%;display:none;opacity: 0.93; background-color: black;z-index: 9999;" > <h1 align="center" style="color: white;">Waiting for free slot...</h1> <h1 id = "waitslottimeid" align="center" style="color: white;">30</h1> </div> <div id="infoWaitForCalibration" style="height: 100%; width: 100%; position: fixed;left: 0px;top: 0%; display: none ;opacity: 0.9;background-color: black;z-index: 999; "> <h1 align="center" style="color: white;"> Please Wait, Calibration processing...</h1> <div id ="clickinfoid" style="position: fixed; height:100%; width:100%; left: 0%;top: 50%;text-align: center; display:block" > <p> Every time you click anywhere on the screen your eyesight accuracy continue improve </p> </div> <div class="loader"></div> </div> <div id="dpimm" style="height: 10cm; width: 10cm; left: 0%; position: fixed; top: 0%; z-index:-1"></div> <div id="CalDivId" style="display: none; z-index: 999;background-color:white; position:fixed; left:0px; top:0px ;width: 100%; height: 100% " > <h1 id = "calinfoid"   style = " text-align: center; position: fixed;margin-left:auto; color:black; z-index: 999;top:25% ; width:100%" >Look at Dot</h1><h1 id = "calinfoWaitid"   style = " text-align: center; position: fixed;margin-left:auto; color:black; z-index: 999;top:60% ; width:100%" >3</h1> <canvas id="CalCanvasId" style="background-color:white ;display: block;  left:0px; top:0px; width: 100%; height: 100%"> </canvas> </div > <div id="initializingid" style="text-align: center; height:100%; width:100%; left: 0px; position: fixed; top: 0%;display:none;opacity: 0.6; background-color: black;z-index: 9999;"> <h1 style="color: white;" >Please wait, Initializing...</h1> <div class="loader"></div> </div > <div id="camid" style=" z-index: 1000;position:absolute; left:50%; top:2% ; margin-left: -160px; " >  <video id ="showvideoid" autoplay width="320" height="240" style=" display: block ;border-radius: 16px;background-color:black;"> </video><img height="240" width="320" id="facemaskimgok" src="https://api.gazerecorder.com/FaceMaskok.png" style=" position:absolute; left:0%; top:0%; opacity: 0.6; display: none; border-radius: 16px;"> <img height="240" width="320" id="facemaskimgno" src="https://api.gazerecorder.com/FaceMaskno.png" style=" position:absolute; left:0%; top:0%; opacity: 0.6; display: block; border-radius: 16px;">  <div id="showinit" style="text-align: center;"> <br> <div> <button class = "buttonCal" disabled id="_ButtonCalibrateId" type="button" onclick="GazeCloudAPI.ShowCalibration()"> <img src="https://api.gazerecorder.com/calibrate.png" width="40" height="40" > <p style = " left:0%; top:0%; margin : 0"> Start Gaze Calibration </p> </button> <p id = "corectpositionid" style = " color: red;margin : 0; display:none"> Please, Corect your head position! </p> </div> <br> Make sure that : <ul style="list-style-type:disc; text-align: left;""> <li>Your face is visible</li> <li>You have good light in your room</li> <li>There is no strong light behind your back</li> <li>There is no light reflections on your glasses</li> </ul> </div > </div> <img id="calimgid" src="https://api.gazerecorder.com/calibrate.png" width="300" height="227" style = "display: none;" > <img id="arrowright" src="https://api.gazerecorder.com/arrow-right.png" style = "display: none;" > <img id="arrowleft" src="https://api.gazerecorder.com/arrow-left.png" style = "display: none;" ><img id="arrowdown" src="https://api.gazerecorder.com/arrow-down.png" style = "display: none;" ><img id="arrowup" src="https://api.gazerecorder.com/arrow-up.png" style = "display: none;" ><img id="arrowimgid" src="https://api.gazerecorder.com/arrow-right.png" width="300" height="227" style = "display: none;" > <canvas id="bgcanvas" width="640" height="480" style="display:none"></canvas> <div id="GazeFlowContainer" style=" background-color: white ;height:100%; width:100%; left: 0px; position: fixed; top: 0%;display:none;opacity: 1.0;z-index: 99;" > </div > <div style = "display:none" ><p id= "calinfolook">Look at dot</p><p id= "calinfohead">Turn your head in the direction of the arrow</p></div>';

        ////////////////////////endHTMLGUI////////////////////////////////
        var video = null; // document.querySelector('video');showvideoid
        var videoOrginal = null;
        var _GazeData = {
            state: -1
        };
        var _LastGazeData = null;

        //==============================
        function GetPix() {
            const __canvas = document.createElement('canvas');
            var __canvasContext = __canvas.getContext('2d');
            __canvas.width = video.videoWidth;
            __canvas.height = video.videoHeight;
            __canvasContext.drawImage(video, 0, 0, __canvas.width, __canvas.height);
            var imgPixels = __canvasContext.getImageData(0, 0, __canvas.width, __canvas.height);
            return imgPixels;
        }
        //------------------------------


        //------------------------------
        /////////////////end GetFPS/////////////////
        var CurCalPoint = null;
        var bIsRunCalibration = false;
        var bIsProcesingCalibration = false;
        var bIsCalibrated = false;
        //===========================================
        function doKeyDown(e) {
            if (e.keyCode == 27)
                if (bIsRunCalibration) FinishCalibration();
        }
        //===========================================
        var _LoopCalibration;

        function AbortCalibration() {
            bIsCalibrated = false;
            CurCalPoint = null;
            bIsProcesingCalibration = false;
            bIsRunCalibration = false;
            clearInterval(_LoopCalibration);
            document.getElementById("CalCanvasId").style.backgroundColor = 'white';
            document.getElementById("CalDivId").style.display = "none";
            document.getElementById("infoWaitForCalibration").style.display = "none";
            closeFullscreen();
            if (false)
                if (GazeCloudAPI.OnCalibrationFail != null) GazeCloudAPI.OnCalibrationFail();
            GUIState = 'InvalidCalibration';
            if (true) UpdateGUI(_GazeData);
        }
        //===========================================
        function FinishCalibration() {

            Info.RunCalStat = GetStat();


            if (true) SendStat();
            if (true) // update gui
            {
                camid.style = ' z-index: 1000;position:absolute; left:0%; top:0%; opacity: 0.7; display:none ';
            }
            CurCalPoint = null;
            bIsProcesingCalibration = true;
            bIsRunCalibration = false;
            clearInterval(_LoopCalibration);
            document.getElementById("CalCanvasId").style.backgroundColor = 'white';
            document.getElementById("CalDivId").style.display = "none";
            ws.send("cmd:FinishCalibration");
            bIsRunCalibration = false;
            closeFullscreen();
            document.getElementById("infoWaitForCalibration").style.display = "block";
            GUIState = 'WaitForCalibrationComplete';
            camid.style.position = "fixed";
            camid.style.left = "0%";
            camid.style.top = "0%";
            camid.style.opacity = 0.7;
            if (true) UpdateGUI(_GazeData);
            if (true) RePlayVideo();
        }
        //////////////////////Calibration///////////////////////
        var ctx = null;

        function InitCalibration() {
            var canvas = document.getElementById("CalCanvasId");
            canvas.width = window.innerWidth; // 2;
            canvas.height = window.innerHeight;
            ctx = canvas.getContext("2d");
            canvas.style.backgroundColor = "white";
            canvas.style.cursor = 'none';
            ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
        }
        var CalDeviceRation = window.devicePixelRatio;

        function etmp() {}

        function ShowCalibration() {
            if (Logg) Logg("ShowCalibration", 2);


            if (GazeCloudAPI.oFullScreen)
                openFullscreen(etmp);

            setTimeout(_ShowCalibration, 200);
        }
        //---------------------
        function _ShowCalibration() {
            if (true) // update gui
            {
                camid.style = ' z-index: 1000;position:fixed; left:0%; top:0%; opacity: 0.7; display:none ';
            }
            var InfoPlot = document.getElementById('calinfoid');
            var InfoWaitPlot = document.getElementById('calinfoWaitid');
            if (true) UpdateGUI(_GazeData);
            GUIState = 'RunCalibration';
            if (true) showinit.style.display = 'none';
            const imagearrow = document.getElementById('arrowimgid');
            const imagecal = document.getElementById('calimgid');
            CalDeviceRation = devicePixelRatio;
            CalDeviceRation = (window.innerWidth * window.devicePixelRatio) / window.screen.width;
            bIsCalibrated = false;
            bIsRunCalibration = true;
            document.getElementById("CalDivId").style.display = "block";
            var canvas = document.getElementById("CalCanvasId");
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (true) UpdateGUI(_GazeData);
            document.addEventListener('keydown', doKeyDown);
            var vPoints = [];
            var mx = .03;
            var my = .05;
            var step = 2; //3;//3;//2;//3;
            var stepx = step;
            var stepy = step;
            var isMobile = window.orientation > -1;
            if (isMobile) {
                stepx = 2;
                stepy = 2;
            }
            if (window.innerWidth < window.innerHeight) {
                stepx = stepy - 1;
            }
            if (GazeCloudAPI.CalibrationType == 1) {
                stepx = 1;
                stepy = 1;
            }
            //////////init///////////////
            var calinfolook = document.getElementById('calinfolook').innerHTML;
            var calinfohead = document.getElementById('calinfohead').innerHTML;
            var SizeF = 1.0
            if (isMobile) SizeF = .7;
            var minSize = 16; // 6 
            var AddSize = 20;
            var showtime = 800; //800;// 1500.0;
            var infotime = 2000;
            AddSize = 20 * SizeF;
            minSize = 10 * SizeF;
            var MainColor = "#777777"; // "gray";//"#101010"; "gray";//"#646C7F";
            vPoints.push({
                x: .5,
                y: .5,
                color: MainColor,
                txt: calinfolook, //"Look at Dot!",
                type: -1,
                time: infotime
            });


            for (var y = my; y <= 1.0; y += (1.0 - 2 * my) / stepy)
                for (var x = mx; x <= 1.0 - mx; x += (1.0 - 2 * mx) / stepx) {
                    if (true) //move point
                    {
                        px = vPoints[vPoints.length + -1].x;
                        py = vPoints[vPoints.length + -1].y;
                        var d = Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
                        var MoveTime = 200 + (600.0 * d);
                        var pp = {
                            x: x,
                            y: y,
                            color: MainColor,
                            type: 1,
                            time: MoveTime
                        };
                        vPoints.push(pp);
                    }
                    var p = {
                        x: x,
                        y: y,
                        color: MainColor,
                        type: 0,
                        time: showtime
                    };
                    vPoints.push(p);
                }
            if (true) {
                var x = .5;
                var y = .5;
                px = vPoints[vPoints.length + -1].x;
                py = vPoints[vPoints.length + -1].y;
                var d = Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
                var MoveTime = 200 + (600.0 * d);
                var pp = {
                    x: x,
                    y: y,
                    color: MainColor,
                    type: 1,
                    time: MoveTime
                };
                vPoints.push(pp);
            }

            if (GazeCloudAPI.oCalibrationData != null) {
                try {
                    var data = JSON.parse(GazeCloudAPI.oCalibrationData);
                    vPoints = data;
                    Logg("oCalibrationData:" + GazeCloudAPI.oCalibrationData, 2);
                } catch (e) {
                    Logg("invalid oCalibrationData:" + GazeCloudAPI.oCalibrationData, 2);
                }
            }


            var Ix = 0;
            var x = 0;
            var y = .3;
            var size = 1.0;
            var startTime = Date.now();
            size = -1;
            Ix = -1;
            Ix = 0;
            size = 1.0;
            if (true) {
                ws.send(sendScreensize());
                ws.send("cmd:StartCalibration");
            }
            if (true) UpdateGUI(_GazeData);
            if (true) {
                RePlayVideo();
            }
            var StartPointFrameNr = CurFrameNr;
            _LoopCalibration = setInterval(() => {
                if (TrackingLostShow) {
                    return;
                }
                if (!bIsRunCalibration) return;
                var duration = Date.now() - startTime;
                try {
                    if (Ix > -1)
                        if (vPoints[Ix].color == "play") showtime *= 1.5;
                    var _conf = duration / vPoints[Ix].time;
                    if (_conf > 1) _conf = 1;
                    size = 1.0 - _conf;

                    var FrameCountOk = true;
                    if (vPoints[Ix].type == 0) {
                        if (CurFrameNr - StartPointFrameNr < 15) FrameCountOk = false;
                        if (duration / vPoints[Ix].time > 2.5) FrameCountOk = true
                    }
                    if (FrameCountOk)
                        if (size < .01 || Ix < 0) ///next point
                        {
                            Ix++;
                            size = 1.0;
                            startTime = Date.now();
                            StartPointFrameNr = CurFrameNr;
                        }
                        //////////////////////finish cal////////////
                    if (Ix > vPoints.length - 1) // stop
                    {
                        FinishCalibration();
                        return;
                    }
                    //////////////////////end finish cal////////////
                    if (vPoints[Ix].color == "play") {
                        var c = size * 255;
                        var color = 'rgb(' + c + ' , ' + c + ' , ' + c + ' )';
                        canvas.style.backgroundColor = color;
                    } else canvas.style.backgroundColor = vPoints[Ix].color;
                    x = vPoints[Ix].x;
                    y = vPoints[Ix].y;
                    if (Ix > 0 && vPoints[Ix].type == 1) // move point
                    {
                        ////////////////// move animation/////////////////
                        var f = 1.0 - size;
                        //f = .5;
                        f = 1.0 - Math.sin(f * (3.14 / 2.0));
                        x = (vPoints[Ix - 1].x * f + (1.0 - f) * vPoints[Ix].x);
                        y = (vPoints[Ix - 1].y * f + (1.0 - f) * vPoints[Ix].y);
                        size = 1.0 - size;
                    }
                    if (false) ctx.globalCompositeOperation = 'destination-over';
                    if (false) {
                        ctx.fillStyle = "#646C7F"; // Specify black as the fill color.
                        ctx.fillRect(0, 0, canvas.width, canvas.height); // Create a filled rectangle.
                    } else ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas

                    if (true) // show info
                    {
                        if (typeof vPoints[Ix].txt !== 'undefined') {
                            InfoPlot.innerHTML = vPoints[Ix].txt;
                            InfoWaitPlot.innerHTML = Math.round(size * 3.0);
                            size = 1;
                        } else {
                            InfoPlot.innerHTML = "";
                            InfoWaitPlot.innerHTML = "";
                        }
                    }
                    ctx.fillStyle = 'red';
                    ctx.beginPath();
                    ctx.arc(x * canvas.width, y * canvas.height, (minSize + AddSize * size), 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                    if (typeof vPoints[Ix].head !== 'undefined') {
                        try {
                            var imge = document.getElementById(vPoints[Ix].head);
                            var ss = 2 * (minSize + AddSize) + 3; //+ 10;
                            ctx.drawImage(imge, x * canvas.width - ss / 2, y * canvas.height - ss / 2, ss, ss);
                        } catch (ee) {}
                    } else {
                        var ss = 2 * (minSize + AddSize) + 3; //+ 10;
                        ctx.drawImage(imagecal, x * canvas.width - ss / 2, y * canvas.height - ss / 2, ss, ss);
                    }
                } catch (ee) //drawing exeption
                {}
                if (_GazeData.state == -1) // tracking lost puse
                {
                    if (vPoints[Ix].type == 1) //move point
                    {
                        Ix++;
                    }
                    CurCalPoint = null;
                } else {
                    if (true) {
                        if (vPoints[Ix].type != 0) _conf = 0;
                        var isMobile = window.orientation > -1;
                        // if(!isMobile)
                        if (true) {
                            CurCalPoint = {
                                x: x * window.innerWidth * window.devicePixelRatio / CalDeviceRation + window.screenX,
                                y: y * window.innerHeight * window.devicePixelRatio / CalDeviceRation + window.screenY + (window.outerHeight - window.innerHeight * window.devicePixelRatio / CalDeviceRation),
                                conf: _conf,
                                type: 0
                            };
                        }
                    }
                }
            }, 30);
            if (true) UpdateGUI(_GazeData);
        }

        //------------------------------
        this.processClick = function(e) {
                if (!GazeCloudAPI.UseClickRecalibration)
                    return;
                var cursorX;
                var cursorY;
                cursorX = e.screenX;
                cursorY = e.screenY;
                //console.log("processClick click document.onmousedown ");
                if (!bIsRunCalibration) {
                    CurCalPoint = {
                        x: cursorX,
                        y: cursorY,
                        conf: 1.0,
                        type: 10
                    };
                }
            }
            //////////////////////end Calibration///////////////////////
            /////////////////////BeginCam///////////////////////
        var ctx = null;
        var _canvas = null;
        var canvasContext = null;
        var bLastUseLowQuality = false;

        function getGrayFrameROIResize(_video, GazeD, bOnlyEyes = false, quality = .9) {
            try {
                if (_canvas == null) {
                    _canvas = document.createElement('canvas');
                    canvasContext = _canvas.getContext('2d');
                }
                var rx = 0;
                var ry = 0;
                var rw = _video.videoWidth;
                var rh = _video.videoHeight;
                if (typeof GazeD === 'undefined' || GazeD.state == -1) {;
                } else {
                    // if(GazeD.rw >= 0 && GazeD.rh >= 0)
                    {
                        rx = GazeD.rx;
                        ry = GazeD.ry;
                        rw = GazeD.rw;
                        rh = GazeD.rh;
                    }
                }
                _canvas.width = 80; //120;//120;//150;
                var fff = .5;
                if (bLastUseLowQuality) fff *= .7;

                if (GazeD.state == -1) _canvas.width = 160; //200;// 160;
                _canvas.height = _canvas.width;
                LastVideoTime = video.currentTime;
                canvasContext.drawImage(_video, rx, ry, rw, rh, 0, 0, _canvas.width, _canvas.height);
                ///////////
                quality = .9;
                // quality = .97;
                if (true)
                    if (GazeD.state == -1) quality = .8;
                    //   quality = .92;
                const datagray = _canvas.toDataURL('image/jpeg', quality);
                var r;
                r = {
                    'imgdata': datagray,
                    'w': _video.videoWidth,
                    'h': _video.videoHeight,
                    'rx': rx,
                    'ry': ry,
                    'rw': rw,
                    'rh': rh,
                    's': _canvas.width
                };
                return r;
            } catch (ee) {
                if (Logg) Logg("getFrame exeption : " + ee.message, -2);
            }
        }
        //--------------------------------------
        /////////////////GetFPS/////////////////
        //------------------------------
        ////////stat////////
        var minNetworkDelay = 999999;
        var maxNetworkDelay = 0;
        var avrNetworkDelay = 0;
        var networkDelay = 0;
        var processkDelay = 0;
        var skipProcessCount = 0;
        var CamFPS = 0;


        function GetStat() {
            var stat = "CamFPS:" + CamFPS + " minNetworkDelay: " + minNetworkDelay + " maxNetworkDelay: " + maxNetworkDelay + " avrNetworkDelay: " + avrNetworkDelay + " skipProcessCount: " + skipProcessCount + " skipF: " + skipProcessCount / CurFrameNr;
            return stat;
        }

        function SendStat() {
            try {
                var stat = "CamFPS:" + CamFPS + " minNetworkDelay: " + minNetworkDelay + " maxNetworkDelay: " + maxNetworkDelay + " avrNetworkDelay: " + avrNetworkDelay + " skipProcessCount: " + skipProcessCount + " kipF: " + skipProcessCount / CurFrameNr;
                if (CamFPS > 0)
                    if (Logg) Logg("stat : " + stat, 5);
                ws.send(stat);
            } catch (e) {}
        }
        //////end stat/////////
        ///////fps///////
        var fpsstartTime = -1;
        var fpst = 0
        var fpscout = 0

        function UpdateCamFPS() {
            if (fpsstartTime == -1) fpsstartTime = Date.now();
            var t = video.currentTime;
            if (t > fpst) {
                fpscout++;
            }
            var tt = Date.now();
            if (tt - fpsstartTime > 1000 * 2) {
                CamFPS = 1000.0 * fpscout / (tt - fpsstartTime);
                //console.log(" CamFPS" + CamFPS);
                if (true) {
                    clearInterval(_LoopCamSend);
                    var interval = 1000 / CamFPS;
                    _CamLoopInterval = interval;
                    interval += 3;
                    if (interval < 33) // max 30 fps
                        interval = 33;
                    //if(interval < 17)// max 60 fps
                    //interval = 17;
                    if (false) {
                        _CamLoopInterval = interval;
                        _LoopCamSend = setInterval(CamSend, _CamLoopInterval);
                    }
                }
            } else {
                fpst = t;
                setTimeout(UpdateCamFPS, 2);
            }
        }
        //////end fps//////
        var bCamOk = false;
        var ws = null;
        var curTimeStap = 0;
        var CurFrameNr = 0;
        var CurFrameReciveNr = 0;
        var CurFrameReciveTime = 0;
        var CurFrameAckNr = 0;
        var CurFrameAckTime = 0;
        /////////////////Init Cam Send/////////////////
        var _fps = -1;
        var _LoopCamSend = null;
        //-------------------------------------
        var oCamSendFPS = 30; //15;//30;//15;//30;
        this.SetFps = function(fps) {
            if (Logg) Logg("SetFps : " + fps, 5);
            if (fps > 30) fps = 30;
            if (fps < 3) fps = 3;
            oCamSendFPS = fps;
        }
        var bGazeCloundLowFpsSend = false;
        this.SetLowFps = function(bval = false) {
                bGazeCloundLowFpsSend = bval;
            }
            //-------------------------------------
        var SendFrameCountDelay = 0;
        var SkipCount = 0;
        var SkipFactor = 1;
        var CheckFpsDelayIter = 0;
        var SkipCamFrameCount = 0;
        var LastVideoTime = 0;
        var LastVideoGrabTime = 0;

        //-----------------------------------------
        var LastSendTime = 0;
        var FrameTime = 0; // Date.now();
        var LastWaitT = 30;
        var bExitCamSendLoop = false;

        function CamSendLoop() {
            if (bExitCamSendLoop) return;
            var videoTime = video.currentTime;
            var bNewVideoGrap = true;
            if (true) {
                var tt = Date.now();
                if (videoTime <= LastVideoTime) {
                    bNewVideoGrap = false;
                    if (false) video.play();
                    SkipCamFrameCount++;
                    var dd = tt - LastVideoGrabTime;
                    if (dd > 500) // frozen min 
                    {
                        video.play();
                        if (Logg) Logg("frozen video : " + SkipCamFrameCount + " dt " + dd, 2);
                        LastVideoGrabTime = tt;
                        LastVideoTime = videoTime;
                        SkipCamFrameCount = 0;
                    }
                    if (true) {
                        requestAnimationFrame(CamSendLoop);
                        return;
                    }
                } else {
                    LastVideoGrabTime = tt;
                    LastVideoTime = videoTime;
                    SkipCamFrameCount = 0;
                }
            }
            if (ws == null) return;
            if (ws.readyState != WebSocket.OPEN) return;
            var bSend = true;
            var BuforMaxC = 6; //6; // 10;
            if (true) {
                BuforMaxC = 5 + minNetworkDelay / 33;
                if (BuforMaxC > 15)
                    BuforMaxC = 15;
                if (BuforMaxC < 5)
                    BuforMaxC = 5;
                if (true) {
                    BuforMaxC *= oCamSendFPS / 30.0;
                    if (BuforMaxC < 2) BuforMaxC = 2;
                }
            }
            var FrameCountDelay = CurFrameNr - CurFrameReciveNr;
            var FrameCountDelayAck = CurFrameNr - CurFrameAckNr;
            if (true) {
                if (_GazeData.state == -1) // tracking lose
                {
                    if (FrameCountDelay > 2) bSend = false;
                } else {
                    if (FrameCountDelay > BuforMaxC) bSend = false;
                }
                if (bGazeCloundLowFpsSend) {
                    if (FrameCountDelay > 1) bSend = false;
                }
                var waitT = 33; //20;//_CamLoopInterval;
                if (FrameCountDelay >= BuforMaxC) waitT = 66;
                if (waitT < .8 * LastWaitT) waitT = .8 * LastWaitT;
                //
                waitT = 30;
                if (true) {
                    waitT = 1.0 / oCamSendFPS * 1000.0 - 2;
                }
                //if( bGazeCloundLowFpsSend)// 5fps
                //	waitT  = 200;
                var t = Date.now();
                var dif = t - LastSendTime;
                if (bSend)
                    if (dif < waitT) {
                        bSend = false;
                    }
                waitT = LastWaitT * .9 + .1 * waitT;
                LastWaitT = waitT;
                SendFrameCountDelay = FrameCountDelay;
            }
            if (bNewVideoGrap)
                SkipCount++;
            if (bSend) {
                SkipCount = 0;
                var OnlyEyes = false;
                if (CurCalPoint != null) ////// cal point///////
                {
                    var cp = Object.assign({}, CurCalPoint);
                    var json_data = JSON.stringify(cp);
                    ws.send(json_data);
                    if (CurCalPoint.type == 10) // reset cur click point
                        CurCalPoint = null;
                } //////end cal point///////
                FrameTime = Date.now();
                LastSendTime = FrameTime;
                var dd = getGrayFrameROIResize(video, _GazeData, OnlyEyes);
                LastSendVideoTime = LastVideoTime;
                curTimeStap = Date.now();
                dd.time = curTimeStap;
                dd.FrameNr = CurFrameNr;
                CurFrameNr++;
                var myJSON = JSON.stringify(dd);
                if (false)
                    SendBinary(myJSON);
                else
                    ws.send(myJSON);
            } // end send
            if (bNewVideoGrap) {
                CheckFpsDelayIter++;
                if (_GazeData.state != -1) // tracking lose
                    if (!bGazeCloundLowFpsSend) {
                        if (CurFrameNr > 100) {
                            var s = 1;
                            if (!bSend) s = 0;
                            SkipFactor = .95 * SkipFactor + s * .05;
                        }
                    }
                var FrameCountDelay = CurFrameNr - CurFrameReciveNr;
                var waitT = 33;
                var processDelay = Date.now() - LastSendTime;
                waitT = _CamLoopInterval;
                waitT -= processDelay;
                if (waitT < 5) waitT = 5;
            }
            if (bSend) {
                var dd = (FrameCountDelay - BuforMaxC * .7) / BuforMaxC;
                if (dd < 0)
                    dd = 0;
                var ww = 30 + 30 * dd;
                setTimeout(function() {
                    requestAnimationFrame(CamSendLoop);
                }, 5); // ww);
            } else
                requestAnimationFrame(CamSendLoop);
        }
        //-------------------------------------

        var curFps = 100;

        var _CamLoopInterval = 36; //15;//10;//36;//15;
        function InitCamSend() {
            //UpdateCamFPS();
            var FPS = 30;
            try {
                if (_fps < 0) {
                    _fps = video.srcObject.getVideoTracks()[0].getSettings().frameRate;
                    //alert("sframeRate " +_fps );
                    FPS = _fps;
                    FPS = 28; // tmp test
                }
            } catch (err) {;
            }
            bExitCamSendLoop = false;
            CamSendLoop();
        }
        //--------------------------------------
        var MediaStrem = null;

        function HideGUI() {
            try {
                var GazeFlowContainer = document.getElementById("GazeFlowContainer");
                GazeFlowContainer.style.display = 'none';
                showinit.style.display = 'none';
                loadid.style.display = 'none';
                initializingid.style.display = 'none';
                CalDivId.style.display = 'none';
                infoWaitForCalibration.style.display = 'none';
                errid.style.display = 'none';
                demoid.style.display = 'none';
                CamAccessid.style.display = 'none';
                camid.style.display = 'none';
                disableStyle('GazeCloudAPI.css', true);
            } catch (ee) {}
        }
        //--------------------------------------
        function CloseWebCam() {
            try {
                bExitCamSendLoop = true;
                if (true) {
                    LastVideoTime = 0;
                    LastCamFrameNr = 0;
                    SkipCamFrameCount = 0;
                    curFps = 30;
                    SkipFactor = 1;
                    _delaySendC = 0;
                    bCamOk = false;
                    //ws = null;
                    _delaySendC = 0;
                    curTimeStap = 0;
                    CurFrameNr = 0;
                    CurFrameReciveNr = 0;
                    CurFrameReciveTime = 0;
                    CurFrameAckNr = 0;
                    CurFrameAckTime = 0;
                    _GazeData.FrameNr = 0;
                    _GazeData.state = -1;
                }

                ForeceCloudServerAdress = false;
                RetrayCountNoSlot = 0;
                ConnectCount = 0;
                GoodFrameCount = 0;
                BadFrameCount = 0;
                bCamOk = false;
                _delaySendC = 0;
                curTimeStap = 0;
                CurFrameNr = 0;
                CurFrameReciveNr = 0;
                CurFrameAckNr = 0;
                CurFrameAckTime = 0;
                RedirectCount = 0;
                if (_LoopCamSend != null) clearInterval(_LoopCamSend);
                _LoopCamSend = null;
                if (MediaStrem != null) MediaStrem.getTracks()[0].stop();
                Disconect();
                UpdateGUI(_GazeData);


            } catch (a) {;
            }
            try {
                if (OnStopGazeFlow != null) OnStopGazeFlow();
            } catch (e) {}
        }
        //======================
        // Older browsers might not implement mediaDevices at all, so we set an empty object first
        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }

        function CheckgetUserMedia() {
            if (navigator.mediaDevices.getUserMedia === undefined) {
                navigator.mediaDevices.getUserMedia = function(constraints) {
                    var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                    if (!getUserMedia) {
                        if (Logg) Logg("getUserMedia is not implemented in this browser! ", -2);
                        alert("Camera access is not supported by this browser! Try: Chrome 53+ | Edge 12+ | Firefox 42+ | Opera 40+ | Safari 11+  ");
                        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                    }
                    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
                    return new Promise(function(resolve, reject) {
                        getUserMedia.call(navigator, constraints, resolve, reject);
                    });
                }
            }
        }
        ///////////////
        var DeneidCount = 0;

        function deniedStream(err) {
            DeneidCount++;
            // ShowErr("Please, Allow Camera Access to start Eye-Tracking!");
            //setTimeout(function () {

            if (document.getElementById("AllowCamInfo") != null)
                alert(document.getElementById("AllowCamInfo").innerHTML);
            else
                alert("Camera access denied! Please, Allow Camera Access to start Eye-Tracking");


            if (Logg) Logg("Camera access denied! " + err.message, 2);
            //if(DeneidCount == 1)
            if (DeneidCount == 0) StartCamera();
            else {
                StopGazeFlow();
                if (GazeCloudAPI.OnCamDenied != null) GazeCloudAPI.OnCamDenied();
            }
            //}, 3000);
        }

        function errorStream(e) {
            if (e) {
                console.error(e);
                if (Logg) Logg("errorStream " + e.name + ": " + e.message, -2);
            }
            StopGazeFlow();
            if (GazeCloudAPI.OnCamDenied != null) GazeCloudAPI.OnCamDenied();
        }
        var backgroundCanvas = null; //document.getElementById('bgcanvas');
        var bgCanCon = null; //backgroundCanvas.getContext('2d');
        function RePlayVideo() {
            return;
        }
        //------------------------
        function startStream(stream) {
            DeneidCount = 0;
            backgroundCanvas = document.getElementById('bgcanvas');
            bgCanCon = backgroundCanvas.getContext('2d');
            MediaStrem = stream;
            //added hidden canvas due to problems with the drawImage() function on Safari browser 
            bgCanCon.drawImage(video, 0, 0);
            video.addEventListener('canplay', function DoStuff() {
                bgCanCon.drawImage(video, 0, 0);
                video.removeEventListener('canplay', DoStuff, true);
                setTimeout(function() {
                    video.play();
                    UpdateCamFPS();
                }, 1000);
            }, true);
            video.srcObject = stream;
            video.play();
            if (false) {
                //added hidden canvas due to problems with the drawImage() function on Safari browser 
                bgCanCon.drawImage(videoOrginal, 0, 0);
                videoOrginal.addEventListener('canplay', function DoStuff() {
                    bgCanCon.drawImage(videoOrginal, 0, 0);
                    videoOrginal.removeEventListener('canplay', DoStuff, true);
                    setTimeout(function() {
                        videoOrginal.play();
                    }, 1000);
                }, true);
                videoOrginal.srcObject = stream;
                videoOrginal.play();
            }
            InitVideo(stream);
        }

        function StartCamera() {
            if (true) {
                try {
                    CheckgetUserMedia();
                } catch (ee) {
                    if (Logg) Logg("CheckgetUserMedia exeption" + ee.mesage, -2);
                }
            }
            //Here is where the stream is fetched
            try {
                navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                    width: 480,
                    height: 640
                }).then(startStream).catch(deniedStream);
            } catch (e) {
                try {
                    navigator.mediaDevices.getUserMedia('video', startStream, deniedStream);
                } catch (e) {
                    errorStream(e);
                }
            }
            video.loop = video.muted = true;
            video.autoplay = true;
            video.load();
            videoOrginal.loop = video.muted = true;
            videoOrginal.autoplay = true;
            videoOrginal.load();
        }
        //////////////////////
        function OpenWebCam() {
            bExitCamSendLoop = false;
            //video = document.querySelector('video');
            video = document.getElementById("showvideoid");
            videoOrginal = document.createElement('video');
            videoOrginal.width = 640;
            videoOrginal.height = 480;
            if (true) {
                video.onended = function() {
                    // alert("video has ended");
                    if (Logg) Logg("video has ended", -2);
                }
                video.onpause = function() {
                    RePlayVideo();
                    // alert("video has onpause");
                    if (Logg) Logg("video has onpause", -2);
                }
            }
            try {
                if (true) //nn
                {
                    video.setAttribute("playsinline", true);
                    videoOrginal.setAttribute("playsinline", true);
                }
            } catch (ee) {}
            document.getElementById("CamAccessid").style.display = 'block';;
            GUIState = 'WaitWebCam';
            var ff = .5; //.3;//.5;// 1;//.5;//1;//2;//1;
            //ff =1.0; // tmp
            var _w_ = 320.0 / ff;
            var _h_ = 240.0 / ff;
            StartCamera();
        }
        //-------------------------------------
        var MediaInfo = "";

        function InitVideo(s) {
            try {
                bCamOk = true;
                Connect();
                if (true) //_gui
                    document.getElementById("CamAccessid").style.display = "none";
                if (true) //nn
                    UpdateGUI(_GazeData);
            } catch (error) {
                console.log("InitVideo err " + error);
            }
        }
        /////////////////////EndCam///////////////////////
        ////////////////connection//////////////////////
        var ForeceCloudServerAdress = false;
        var GazeFlowSesionID = null;
        var GazeCloudServerAdress = "wss://cloud.gazerecorder.com:";
        var GazeCloudServerPort = 43334;
        var isWaitForAutoryzation = null;
        var RedirectCount = 0;
        var ConnectionOk = false;
        var ConnectCount = 0;
        var GoodFrameCount = 0;
        var BadFrameCount = 0;
        var RedirectPort = 43335;
        //------------------------------
        var GetCloudAdressReady = false;
        var _WaitForGetCloudAdress = null;
        var GetCloudAdresInfo = null;


        //------------------------------
        var _WaitForGetCloudAdressReconect = null;
        var GetCloudAdressReconectCount = 0;
        var vConnectHistory = [];

        ////////////////////
        //------------------------------
        function ResetGetCloudAdressReconnect() {
            vConnectHistory = [];
            GetCloudAdressReconectCount = 0;
            if (_WaitForGetCloudAdressReconect != null) {
                clearTimeout(_WaitForGetCloudAdressReconect);
                _WaitForGetCloudAdressReconect = null;
            }
        }
        //------------------------------

        function GetCloudAdressReconnectFail() {

            if (_WaitForGetCloudAdressReconect != null) {
                clearTimeout(_WaitForGetCloudAdressReconect);
                _WaitForGetCloudAdressReconect = null;
            }
            if (Logg) Logg("GetCloudAdressReconnectFail  ");


            ShowErr("Can not connect to GazeFlow server!");
            return;
        }
        //------------------------------
        function GetCloudAdressReconnect() {


            Disconect();

            if (Logg) Logg("GetCloudAdressReconnect wait");

            if (GetCloudAdressReconectCount > 3) {
                GetCloudAdressReconnectFail();
                return;
            }


            GetCloudAdressReconnectReady = false;
            var myJSON = JSON.stringify(vConnectHistory);
            var url = 'https://api.gazerecorder.com/GetCloudAdress/?vConnectHistory=' + myJSON;;
            let req = new XMLHttpRequest();
            let formData = new FormData();
            req.open("GET", url);

            if (_WaitForGetCloudAdressReconect != null) {
                clearTimeout(_WaitForGetCloudAdressReconect);
                _WaitForGetCloudAdressReconect = null;
            }

            req.onload = function() {

                    try {
                        var info = JSON.parse(req.response);
                        GetCloudAdresInfo = info;
                        if (typeof info.err !== 'undefined')
                            if (info.err != "") {
                                ShowErr(info.err);
                                return;
                            }

                        if (info.adress == 'null') {
                            GetCloudAdressReconnectFail();
                            return;
                        }
                        if (Logg) Logg("GetCloudAdressReconnectFail ok");
                        GazeCloudServerAdress = info.adress;
                        GazeCloudServerPort = info.port;
                        GetCloudAdressReconnectReady = true;
                        GetCloudAdressReady = true;
                        ConnectCount = 0;
                        RedirectCount = 0;


                        Connect();
                    } catch (e) {}
                }
                //end onload
            req.onerror = function(e) {


                GetCloudAdressReconnectFail();


                if (Logg) Logg("GetCloudAdressReconnect err ");
            }
            req.send(null);
        }


        //------------------------------
        function WaitForAutoryzation() {
            RedirectPort = GazeCloudServerPort + 1;
            if (isWaitForAutoryzation != null) {
                clearTimeout(isWaitForAutoryzation);
                isWaitForAutoryzation = null;
            }
            isWaitForAutoryzation = setTimeout(function() {
                if (true) //tmp
                    if (isWaitForAutoryzation == null) return;
                if (!ConnectionOk) {
                    console.log("WaitForAutoryzation fail: reconect");
                    if (true) {
                        RedirectPort = GazeCloudServerPort + ConnectCount;
                        if (RedirectPort > GazeCloudServerPort + 4) RedirectPort = GazeCloudServerPort + 1;
                        var _url = GazeCloudServerAdress + RedirectPort;
                        console.log("RedirectCount: " + RedirectCount + " url " + _url);
                        if (Logg) Logg("RedirectCount: " + RedirectCount + " url " + _url, 2);
                        RedirectCount++;
                        Connect(_url);
                    } else Connect();
                }
                if (isWaitForAutoryzation != null) {
                    clearTimeout(isWaitForAutoryzation);
                    isWaitForAutoryzation = null;
                }
            }, 10000); // 5000); 
        }
        //======================================
        var Info = { 'RunCalStat': '', 'RunStat': '', 'calInfo': '' };
        this.GetInfo = function() {
            return Info;
        }


        function OnMessageGaze(evt) {
            if (!ConnectionOk) {
                if (evt.data.substring(0, 2) == "ws") {
                    //console.log("redirect: " + evt.data);
                    if (Logg) Logg("redirect: " + evt.data, 2);
                    Connect(evt.data);
                    return;
                }
                if (evt.data == "no free slots") {
                    console.log("no free slots");
                    WaitForSlot();
                    //alert( evt.data   );
                    ws.onclose = null;
                    ws.close();
                    return;
                }
                if (evt.data.substring(0, 2) == "ok")
                //if (evt.data == "ok")
                {
                    GazeFlowSesionID = evt.data.substring(2);
                    ConnectionOk = true;
                    if (isWaitForAutoryzation != null) {
                        clearTimeout(isWaitForAutoryzation);
                        isWaitForAutoryzation = null;
                    }
                    ////
                    //console.log("authorization ok");
                    if (Logg) {
                        Logg("authorization ok", 2);
                        Logg("GazeFlowSesionID: " + GazeFlowSesionID, 2);
                    }
                    ws.send(sendScreensize()); // Send appKey
                    InitCamSend();
                    if (false) //tmp
                    {
                        if (initializingid.style.display != 'none') initializingid.style.display = 'none';
                    }
                    return;
                }
            } // if(!ConnectionOk)
            ///////gaze data//////////
            {
                var received_msg = evt.data;
                if (evt.data.substring(2, 7) == "AckNr") {
                    var ack = JSON.parse(evt.data);
                    networkDelay = Date.now() - ack.time;
                    if (networkDelay < minNetworkDelay) minNetworkDelay = networkDelay;
                    if (networkDelay > maxNetworkDelay) maxNetworkDelay = networkDelay;
                    if (networkDelay < 10 * minNetworkDelay) avrNetworkDelay = (avrNetworkDelay * ack.AckNr + networkDelay) / (ack.AckNr + 1);

                    CurFrameAckNr = ack.AckNr;
                    CurFrameAckTime = ack.time;
                    return;
                }
                if (evt.data.substring(0, 4) == "Demo") {
                    console.log(evt.data);
                    ShowDemoLimit();
                    alert(evt.data);
                    ws.onclose = null;
                    if (false) ws.close();
                    return;
                }
                ////////////Calibration complete//////////
                if (evt.data.substring(0, 4) == "Cal:") {

                    Info.calInfo = evt.data;


                    if (Logg) Logg("cal complete " + evt.data, 2);
                    try {
                        document.getElementById("infoWaitForCalibration").style.display = "none";
                        try {
                            if (GazeCloudAPI.OnCalibrationComplete != null) GazeCloudAPI.OnCalibrationComplete();
                            if (true)
                                disableStyle('GazeCloudAPI.css', true);
                        } catch (e) {;
                        }
                    } catch (e) {};
                    bIsProcesingCalibration = false;
                    bIsCalibrated = true;

                    if (evt.data.substring(4, 6) == "no") {


                        if (document.getElementById("InvalidCalibrationInfo") != null)
                            ShowErr(document.getElementById("InvalidCalibrationInfo").innerHTML);
                        else
                            ShowErr("Invalid Calibration!");


                    }
                    return;
                }
                ////////////end Calibration complete//////////
                try {
                    if (_GazeData.state == -1) {
                        GoodFrameCount = 0;
                        BadFrameCount++;
                    } else {
                        GoodFrameCount++;
                        BadFrameCount = 0;
                    }
                    _LastGazeData = Object.assign({}, _GazeData);
                    var GazeData = JSON.parse(received_msg);
                    var LastNr = _GazeData.FrameNr;
                    _GazeData = GazeData;
                    CurFrameReciveNr = GazeData.FrameNr;
                    CurFrameReciveTime = GazeData.time;
                    processkDelay = Date.now() - GazeData.time;
                    var skipC = _GazeData.FrameNr - LastNr - 1;
                    if (!isNaN(skipC))
                        if (skipC > 0)
                            skipProcessCount += skipC;
                        // console.log("processkDelay" + processkDelay + " skipC " + skipC);
                    PlotGazeData(GazeData);
                    return;
                } catch (error) {
                    console.error(error);
                }
            }
        }


        //========================
        function Disconect() {
            try {
                ConnectionOk = false;

                if (isWaitForAutoryzation != null) {

                    try {
                        clearTimeout(isWaitForAutoryzation);
                        isWaitForAutoryzation = null;
                    } catch (ee) {}

                }

                if (ws != null) {
                    ws.onopen = null;
                    ws.onerror = null;
                    ws.onmessage = null;
                    ws.onclose = null;
                    try {
                        ws.send('exit');
                    } catch (ee) {}
                    ws.close();
                    delete ws;
                    ws = null;
                }
            } catch (error) {}
        }


        //------------------
        function Connect(_url = "") {
            try {
                bIsCalibrated = false;
                bIsRunCalibration = false;
                bIsProcesingCalibration = false;
                Disconect();
                ConnectCount++;
                if (ConnectCount > 4) {
                    console.log("try connect count" + ConnectCount);
                    //ShowErr("Can not connect to GazeFlow server!");
                    GetCloudAdressReconnect();
                    return;
                }
                AppKey = "AppKeyDemo";
                if (GazeCloudAPI.APIKey)
                    AppKey = GazeCloudAPI.APIKey;
                ConnectionOk = false;
                if ("WebSocket" in window) {
                    var port = GazeCloudServerPort;
                    var url = GazeCloudServerAdress + port;
                    if (_url == "") {
                        _url = GazeCloudServerAdress + GazeCloudServerPort; //"43334";
                        try {
                            vConnectHistory.push(_url);
                            ws = new WebSocket(_url);
                        } catch (ec) {
                            if (Logg) Logg(" connect exeption: " + ec.message, -2);
                        };
                    } else // reconect
                    {
                        var _ws; //= new WebSocket(_url);
                        try {
                            vConnectHistory.push(_url);
                            _ws = new WebSocket(_url);
                        } catch (ecc) {
                            if (Logg) Logg(" reconnect exeption: " + ecc.message, -2);
                        };
                        ws = _ws;
                    } //else
                    if (Logg) {
                        Logg("connecting: " + _url, 2);
                    }
                    //console.log("connecting: " + _url);
                    //////////////////////////////////////////////////
                    ws.onopen = function() {
                            //if (Logg)  Logg("Connected", -2);

                            //console.log("connected");
                            WaitForAutoryzation();
                            ws.send("AppKey:" + AppKey); // Send appKey
                        } ///////////end open///////////////////
                        ///////////////////////////////////////////////////
                    ws.onerror = function(error) {
                            if (Logg) {
                                var myJSON = JSON.stringify(error);
                                Logg(ConnectCount + " ws.onerror  ConnectionOk: " + ConnectionOk, -2);
                            }
                            if (!ConnectionOk)
                            // if (ConnectCount < 4) {
                                if (ConnectCount < 3) {
                                var port = GazeCloudServerPort + ConnectCount
                                    //if (ConnectCount == 3) port = 80; // port=443;// port = 80;
                                if (ConnectCount == 2) port = 443; // port = 80;
                                var _url = GazeCloudServerAdress + port;
                                console.log("ws.onerror  ConnectCount try again" + ConnectCount + "url " + _url);
                                Connect(_url);
                            } else {

                                GetCloudAdressReconnect();
                            }
                        }
                        ///////////////////////////////////////////////////
                    ws.onmessage = OnMessageGaze;
                    //////////////////////////////////
                    ws.onclose = function(event) {
                        if (Logg) {
                            var myJSON = JSON.stringify(event);
                            Logg(" ws.onclose " + myJSON, -2);
                        }
                        if (bIsProcesingCalibration || bIsRunCalibration) {
                            AbortCalibration();
                            // ShowErr("Invalid Calibration");


                            if (document.getElementById("InvalidCalibrationInfo") != null)
                                ShowErr(document.getElementById("InvalidCalibrationInfo").innerHTML);
                            else
                                ShowErr("Invalid Calibration!");

                        } else ShowErr("GazeCloud server connection lost!");
                    };
                } else {
                    alert("WebSocket NOT supported by your Browser!");
                    if (Logg) Logg("WebSocket NOT supported by your Browser", -2);
                }
                document.getElementById("initializingid").style.display = 'block'; //_gui
                GUIState = 'InitConnection';
            } catch (ee) {
                if (Logg) Logg(" Connect exeption " + JSON.stringify(ee), -2);
            }
        }
        //--------------------------------------


        var RetrayCount = 0;
        var RetrayCountNoSlot = 0;

        function WaitForSlot() {
            if (Logg) Logg("WaitForSlot", 2);
            GUIState = 'WaitForSlot';
            if (true) // 
                initializingid.style.display = 'none';
            if (isWaitForAutoryzation != null) {
                clearTimeout(isWaitForAutoryzation);
                isWaitForAutoryzation = null;
            }
            document.getElementById("waitslotid").style.display = 'block';
            document.getElementById("waitslottimeid").innerHTML = "30";
            var start = Date.now();
            var _LoopSlotWait = setInterval(() => {
                var t = 30 - (Date.now() - start) / 1000.0;
                t = Math.round(t);
                document.getElementById("waitslottimeid").innerHTML = t;
                if (t < 0) {
                    clearInterval(_LoopSlotWait);
                    document.getElementById("waitslotid").style.display = 'none';
                    Connect();
                    RetrayCount++;
                    RetrayCountNoSlot++;
                }
            }, 1000);
        }
        ////////////////end connection//////////////////////
        //======================


        /////////////Result//////////////////////

        let GazeResultEvents = [];

        function GazeEvent() {
            this.docX = 0;
            this.docY = 0;
            this.time = 0;
            this.state = -1;
        }

        function GetGazeEvent(time) {
            var BestIx = 0;
            var BestDif = 99999999999999;
            var fLen = GazeResultEvents.length;
            if (fLen == 0) return null;
            if (LastGetGazeEvent == null) LastGetGazeEvent = GazeResultEvents[0];
            for (i = 0; i < fLen; i++) {
                var dif = Math.abs(GazeResultEvents[i].time - time);
                if (dif < BestDif) {
                    BestDif = dif;
                    BestIx = i;
                } else break;
            }
            if (BestDif > 200) return null;
            var out = GazeResultEvents[BestIx];
            LastGetGazeEvent = out;
            return out;
        }
        ////////////////////////////////
        var maxDelay = 0;
        var avrDelay = 33;
        var LastGetGazeEventIx = 0;
        var LastGetGazeEvent = null;

        function PlotGazeData(GazeData) {
            var delay = Date.now() - GazeData.time;
            var FrameCountDelay = CurFrameNr - CurFrameReciveNr;
            if (delay > maxDelay) maxDelay = delay;
            avrDelay = .99 * avrDelay + .01 * delay;
            var x = GazeData.GazeX - window.screenX;
            var y = GazeData.GazeY - window.screenY - (window.outerHeight - window.innerHeight * window.devicePixelRatio / CalDeviceRation);
            x /= window.devicePixelRatio / CalDeviceRation;
            y /= window.devicePixelRatio / CalDeviceRation;
            if (true) //boundary lim
            {
                var _m = 50;
                if (_m < window.innerWidth / 12.0) _m = window.innerWidth / 12.0;
                if (_m < window.innerHeight / 12.0) _m = window.innerHeight / 12.0
                var _h_ = (window.outerHeight - window.innerHeight);;
                if (x < 0 && x > -_m) x = .2 * x //;x = 0;
                if (y < 0 && y > -_m) y = .2 * y; //y = 0;
                var _w = window.innerWidth;
                var _h = window.innerHeight;;
                if (x > _w && x - _w < _m) x = .2 * x + .8 * _w; //  x = _w;
                if (y > _h && y - _h < _m)
                //y = _h;
                    y = .2 * y + .8 * _h; //  x = _w;
            }
            if (true) {
                var scrollY = Math.max(document.body.scrollTop, window.scrollY)
                var scrollX = Math.max(document.body.scrollLeft, window.scrollX)
                x += scrollX; //document.body.scrollTop;
                y += scrollY; //document.body.scrollTop;
            }
            if (true) {
                GazeData.Xview = x / window.innerWidth;
                GazeData.Yview = y / window.innerHeight
                GazeData.docX = x;
                GazeData.docY = y;
            }
            if (GazeCloudAPI.OnResult != null) {
                var outGazeData = GazeData;
                outGazeData.docX = x;
                outGazeData.docY = y;
                GazeCloudAPI.OnResult(outGazeData);
            }
            var Gazeevent = new GazeEvent();
            Gazeevent.docX = Math.round(x);
            Gazeevent.docY = Math.round(y);
            Gazeevent.time = GazeData.time;
            Gazeevent.state = GazeData.state;
            GazeResultEvents.push(Gazeevent);
            if (true) {
                var t = Date.now();
                var webevent = {
                    type: 20,
                    data: Gazeevent,
                    timestamp: t
                };
                eventsWebRec.push(webevent);
                try {
                    if (GazeCloudAPI.OnGazeEvent != null) {
                        GazeCloudAPI.OnGazeEvent(webevent);
                    }
                } catch (e) {}
                /* */
            }
            ///////////////////HeatMapLive//////////////
            if (typeof heatmap !== 'undefined')
                if (heatmap != null)
                    if (!bIsRunCalibration && !bIsProcesingCalibration && bIsCalibrated) {
                        if (GazeData.state == 0) {
                            var Precision = 1; //5;
                            var _x = Math.round(x / Precision) * Precision + (.5 * Precision - .5);
                            var _y = Math.round(y / Precision) * Precision + (.5 * Precision - .5);
                            _x = Math.round(_x);
                            _y = Math.round(_y);
                            var timedif = _GazeData.time - _LastGazeData.time;
                            // console.log("timedif " + timedif);
                            var v = timedif / 33;
                            if (v > 5) v = 5;
                            try {
                                //AddHeatMapDataWin(_x, _y, v, 0, 0);
                                //if (false) 
                                heatmap.addData({
                                    x: _x,
                                    y: _y,
                                    value: v
                                });
                            } catch (e) {}
                        }
                    }
                    ///////////////////end HeatMapLive//////////////
            UpdateGUI(GazeData);
        }
        /////////////////////////////////
        ///////////////////Gui//////////////////////
        var GUIState = 'none';
        var ButtonCalibrate = document.getElementById("_ButtonCalibrateId");
        //var facemaskimg = document.getElementById("facemaskimg");
        var facemaskimgOk = document.getElementById("facemaskimgok");
        var facemaskimgNo = document.getElementById("facemaskimgno");
        var showinit = document.getElementById("showinit");
        var camid = document.getElementById("camid");
        var loadid = document.getElementById("loadid");
        var initializingid = document.getElementById("initializingid");
        var DocmentLoaded = false;
        var CalDivId = document.getElementById("CalDivId");
        var infoWaitForCalibration = document.getElementById("infoWaitForCalibration");
        var waitslotid = document.getElementById("waitslotid");
        var errid = document.getElementById("errid");
        var demoid = document.getElementById("demoid");
        var CamAccessid = document.getElementById("CamAccessid");
        var GazeFlowContainer = document.getElementById("GazeFlowContainer");
        var corectpositionid = document.getElementById("corectpositionid");
        var GUIInitialized = false;
        var disableStyle = function(styleName, disabled) {
            return;
        };

        function InitGUI() {

            if (document.getElementById("GazeCloudGUIid") != null) {

                document.getElementById("GazeCloudGUIid").style.display = 'block';
                GUIInitialized = true;
                Logg("custom gui", 2);
            }


            if (!GUIInitialized) {
                document.body.insertAdjacentHTML('afterbegin', _GuiHtml);
            }
            try {
                disableStyle('GazeCloudAPI.css', false);
            } catch (e) {}
            GUIInitialized = true;
            ////////init gui/////
            DocmentLoaded = true;
            video = document.querySelector('video');
            ButtonCalibrate = document.getElementById("_ButtonCalibrateId");
            facemaskimgOk = document.getElementById("facemaskimgok");
            facemaskimgNo = document.getElementById("facemaskimgno");
            corectpositionid = document.getElementById("corectpositionid");
            showinit = document.getElementById("showinit");
            camid = document.getElementById("camid");
            loadid = document.getElementById("loadid");
            initializingid = document.getElementById("initializingid");
            infoWaitForCalibration = document.getElementById("infoWaitForCalibration");
            waitslotid = document.getElementById("waitslotid");
            errid = document.getElementById("errid");
            demoid = document.getElementById("demoid");
            CamAccessid = document.getElementById("CamAccessid");
            CalDivId = document.getElementById("CalDivId");
            GazeFlowContainer = document.getElementById("GazeFlowContainer");
            ////////end init gui/////
            showinit.style.display = 'block';
            GazeFlowContainer.style.display = 'block';
            if (true) // init gui
            {
                camid.style.marginLeft = -camid.scrollWidth / 2;
                if (true) {

                    facemaskimgOk.width = video.width;
                    facemaskimgOk.height = video.height;
                    facemaskimgNo.width = video.width;
                    facemaskimgNo.height = video.height;
                }
            }
            InitCalibration();
        }
        //--------------------------------------
        var TrackingLostShow = true;
        var LatTrackingLostShow = true;

        function UpdateGUI(GazeData) {
            // 0 init
            // 1 calirate
            // 2 calibrate lost
            // 3 tracking
            // 4 racking lost
            // 5 procesing
            try {
                var GuiState = 0; {
                    if (CurFrameReciveNr > 2) {
                        if (initializingid.style.display != 'none') {
                            initializingid.style.display = 'none';
                            if (Logg) Logg("Initialized ", 2);
                        }
                    } else return;
                }
                ////////////////
                var showInit = false;
                showInit = (!bIsCalibrated && !bIsProcesingCalibration && !bIsRunCalibration);
                var delayC = 5;
                if (TrackingLostShow) {
                    if (GoodFrameCount > delayC) TrackingLostShow = false;
                } else {
                    if (BadFrameCount > delayC) TrackingLostShow = true;
                }
                var display = 'none';
                if (TrackingLostShow || (!bIsCalibrated && !bIsProcesingCalibration && !bIsRunCalibration)) display = 'block';
                else display = 'none';
                if (bIsProcesingCalibration) display = 'none';
                var bHideVideo = false;
                if (display == 'none') {
                    bHideVideo = true;
                    camid.style.display = 'block';
                }
                ///
                var f = 1.0;
                var _w;
                var _h;
                if (true) {
                    if (bHideVideo) {
                        _w = 1;
                        _h = 1;
                    } else {
                        _w = 320;
                        _h = 240;
                    }
                }
                if (video.width != _w || video.height != _h) {
                    {
                        video.width = _w;
                        video.height = _h;
                    }
                    facemaskimgOk.width = video.width;
                    facemaskimgOk.height = video.height;
                    facemaskimgNo.width = video.width;
                    facemaskimgNo.height = video.height;
                    if (true) RePlayVideo();
                }
                if (LatTrackingLostShow != TrackingLostShow) {
                    // if (Logg) Logg("Face : " + TrackingLostShow, 2);
                    if (!TrackingLostShow) {
                        facemaskimgOk.style.display = "block";
                        facemaskimgNo.style.display = "none";
                    } else {
                        facemaskimgOk.style.display = "none";
                        facemaskimgNo.style.display = "block";
                    }
                    if (ButtonCalibrate.disabled != TrackingLostShow) ButtonCalibrate.disabled = TrackingLostShow;
                    if (display) {
                        var d = null;
                        if (TrackingLostShow) d = 'block';
                        else d = 'none';
                        if (corectpositionid.style.display != d) corectpositionid.style.display = d;
                    }
                }
                var dd = null;
                if (showinit.style.display != 'none') dd = "block";
                else dd = "none";
                if (GazeFlowContainer.style.display != dd) GazeFlowContainer.style.display = dd;
                LatTrackingLostShow = TrackingLostShow;
            } catch (e) {
                console.log("update gui exeption ");
            }
        } //-----------------------------------
        function ShowDemoLimit() {
            if (Logg) Logg("DemoLimit", 2);
            GUIState = 'DemoLimit';
            document.getElementById("demoid").style.display = "block";
            setTimeout(StopGazeFlow, 3000);
            //CloseWebCam();
        }
        //--------------------------------------
        function ShowErr(txt) {
            if (document.getElementById("errid").style.display != "none") return;
            CloseWebCam();
            if (Logg) Logg("ShowErr:" + txt, 2);
            GUIState = 'Err';
            document.getElementById("errid").style.display = "block";
            //if(document.getElementById("errid").style.display == "none")// second err
            document.getElementById("errmsgid").innerHTML = txt;
            UpdateGUI(_GazeData);
            if (GazeCloudAPI.OnError != null)
                GazeCloudAPI.OnError(txt);
        }
        ////////////////////end Gui////////////////
        this.get_browser_info = get_browser_info;

        function get_browser_info() {
            var ua = navigator.userAgent,
                tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                return {
                    name: 'IE ',
                    version: (tem[1] || '')
                };
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\bOPR\/(\d+)/)
                if (tem != null) {
                    return {
                        name: 'Opera',
                        version: tem[1]
                    };
                }
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) {
                M.splice(1, 1, tem[1]);
            }
            return {
                name: M[0],
                version: M[1]
            };
        }

        function sendScreensize() {
            try {
                var mm_x = document.getElementById('dpimm').offsetWidth;
                var mm_y = document.getElementById('dpimm').offsetHeight;
                var wmm = window.screen.width / mm_x; /// window.devicePixelRatio ;
                var hmm = window.screen.height / mm_y; /// window.devicePixelRatio ;
                var w = window.screen.width; //* window.devicePixelRatio;
                var h = window.screen.height; //* window.devicePixelRatio;
                if (true) {
                    wmm /= CalDeviceRation;
                    hmm /= CalDeviceRation;
                }
                var orientation = window.orientation;
                var isMobile = window.orientation > -1;
                if (typeof window.orientation === 'undefined') orientation = 10;
                var info = get_browser_info();
                info.platform = navigator.platform;
                info.userAgent = navigator.userAgent;
                info.Media = MediaInfo;

                var r = {
                    'wmm': wmm,
                    'hmm': hmm,
                    'wpx': w,
                    'hpx': h,
                    'ratio': window.devicePixelRatio,
                    orientation: orientation,
                    winx: window.screenX,
                    winy: window.screenY,
                    aW: screen.availWidth,
                    aH: screen.availHeight,
                    'innerWidth': window.innerWidth,
                    'outerWidth': window.outerWidth,
                    'innerHeight': window.innerHeight,
                    'outerHeight': window.outerHeight,
                    "mm_x": mm_x,
                    "mm_y": mm_y,
                    "CalDeviceRation": CalDeviceRation,
                    'camw': video.videoWidth,
                    'camh': video.videoHeight,
                    info: info
                };

                var myJSON = JSON.stringify(r);
                if (false) alert("screen s" + myJSON);
                return myJSON;
            } catch (e) {
                console.log("sendScreensize exeption ");
            }
        }
        ////////////////////////////////////////
        function openFullscreen(callback) {
            // return;
            try {
                var elem = document.body;
                if (elem.requestFullscreen) {
                    elem.requestFullscreen().then(callback);
                } else if (elem.mozRequestFullScreen) {
                    /* Firefox */
                    elem.mozRequestFullScreen().then(callback);;
                } else if (elem.webkitRequestFullscreen) {
                    /* Chrome, Safari and Opera */
                    elem.webkitRequestFullscreen().then(callback);;
                } else if (elem.msRequestFullscreen) {
                    /* IE/Edge */
                    elem.msRequestFullscreen().then(callback);;
                    if (false)
                        if (callback) callback();
                }
            } catch (ee) {
                if (callback) callback();
            }
        }
        /* Close fullscreen */
        function closeFullscreen() {
            return;
        }
        ////////////////////////////////////////
        /////////////////////API/////////////////////////
        function ResetIntervals() {
            try {
                if (isWaitForAutoryzation != null) {
                    clearTimeout(isWaitForAutoryzation);
                    isWaitForAutoryzation = null;
                }
                if (_LoopSlotWait != null) {
                    clearInterval(_LoopSlotWait);
                    _LoopSlotWait = null;
                }


                ResetGetCloudAdressReconnect();

            } catch (e) {}
        }
        //--------------------
        var bStarted = false;

        function StartGazeFlow() {
            if (bStarted)
                return;
            if (bStarted) CloseWebCam();
            bStarted = true;
            InitGUI();
            if (true) {
                ResetIntervals();
                document.getElementById("waitslotid").style.display = 'none';
                document.getElementById("infoWaitForCalibration").style.display = "none";
                document.getElementById("errid").style.display = "none";
                document.getElementById("errmsgid").innerHTML = "";
                camid.style = ' z-index: 1000;position:absolute; left:50%; top:2%  ; margin-left: -160px; ';
                camid.style.marginLeft = -camid.scrollWidth / 2;
            }
            GazeResultEvents = [];
            try {
                if (typeof GetCloudAdresInfo !== 'undefined')
                    if (GetCloudAdresInfo != null) {
                        if (typeof GetCloudAdresInfo.err !== 'undefined')
                            if (GetCloudAdresInfo.err != null)
                                if (GetCloudAdresInfo.err != "") {
                                    ShowErr(GetCloudAdresInfo.err);
                                    return;
                                }
                    }
            } catch (eee) {}
            OpenWebCam();
            //if(false ) /// connect after camera allow acess
            //  Connect(); 
            if (Logg) Logg("StartGazeFlow", 2);
        }
        //----------------------------------
        function StopGazeFlow() {
            try {
                SendStat();

                Info.RunStat = GetStat();

                CloseWebCam();
                HideGUI();
                if (Logg) Logg("StopGazeFlow", 2);
                bStarted = false;
            } catch (error) {;
            }
        }
        //----------------------------------
        window.addEventListener("beforeunload", function(e) {
            //CloseWebCam();
            GazeCloudAPI.StopEyeTracking();
        }, false);


        var LogTxt = '';

        function Logg(txt, type = 0) {

            LogTxt += txt + ' | ';
        }

        if (true) window.addEventListener('DOMContentLoaded', function(event) {
            if (Logg) Logg("GazeCloundAPI v:1.0.2 ", 2);
        });

        this.SendLog = function(txt, type = 0) {
            Logg(txt, type);
        }

    } //end GazeCloudAPIInit

/////////Version 1.0.0///////////
var StartGazeFlow = GazeCloudAPI.StartEyeTracking;
var StopGazeFlow = GazeCloudAPI.StopEyeTracking;
var SetLowFps = GazeCloudAPI.SetLowFps;
var get_browser_info = GazeCloudAPI.get_browser_info;
var MediaInfo = "";
var processClick = GazeCloudAPI.processClick;
/////////end Version 1.0.0///////////ssClick;