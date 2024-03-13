import { useEffect, useState, useRef, useLayoutEffect } from "react";
import styles from "./styles.module.css";

let GloablTime = 0;

function Timer() {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [shouldScreenAppear, setShouldScreenAppear] = useState(false);

    useEffect(() => {
        GloablTime = time;
        if (time !== 0 && time%15 === 0) {
            setShouldScreenAppear(true)
        } else {
            setShouldScreenAppear(false)
        }
        let intervalId;
        if (isRunning) {
            intervalId = setInterval(() => setTime(time+1), 1000)
        }
        return () => clearInterval(intervalId);
    }, [isRunning, time]);

    const reset = () => setTime(0);
    const startStop = () => setIsRunning(!isRunning);

    return (
        <div className={styles.timerContainer}>
            <div className={styles.timerValueWrapper}>
                <span>{time}</span>
            </div>
            {shouldScreenAppear ? <div className={styles.redScreen}></div> : <div></div>}
            <div className={styles.timerButtonsWrapper}>
                <button onClick={() => startStop()}>{isRunning ? "stop" : "start"}</button>
                <button onClick={() => {
                    setTime(0);
                    setIsRunning(false);
                }}>reset</button>
            </div>
        </div>
    )
}

function ScaleLine(props) {
    const [lineHeight, setLineHeight] = useState(props.height);
    const [scaleMarks, setScaleMarks] = useState([{name: "Weakest possible", percentage: 0}]);
    const [clicks, setClicks] = useState([]);
    const scaleLineRef = useRef(null);

    function addScaleMark(scaleMarkProps) {
        setScaleMarks([...scaleMarks, scaleMarkProps]);
    }
    function addClick(clickProps) {
        setClicks([...clicks, clickProps])
    }
    function onScaleLineClick(e) {
        let percentage = getPercentage(e.clientY);
        addScaleMark({name: "seconds: " + GloablTime, percentage: percentage, isData: true})
    }
       
    function getPercentage(clickY) {
        const scaleLineElement = scaleLineRef.current;
        const scaleLineCoords = scaleLineElement.getBoundingClientRect();
        const clickYFromBottom = scaleLineCoords.bottom - clickY;
        console.log(scaleLineCoords.top, clickY)
        let percentage = clickYFromBottom/lineHeight * 100;
        if (percentage > 100) percentage = 100;
        if (percentage < 0) percentage = 0;
        return Number(percentage.toFixed(3));
    }
    return (  
        <div className={styles.scaleLineContainer}>
            <ScaleMarkAdder handleScaleMarkCreation={addScaleMark}></ScaleMarkAdder>
            <div onClick={onScaleLineClick} className={styles.scaleLineWrapper} style={{height: lineHeight + 'px'}}>
                <div ref={scaleLineRef} className={styles.scaleLine}></div>
                {scaleMarks.map((scaleMark, i) => {
                console.log("3");
                return <ScaleMark scaleMarksState={[scaleMarks, setScaleMarks]} scaleMarksArrayNumber={i} isLeft={i%2} key={i} percentage={scaleMark.percentage} markName={scaleMark.name} parentHeight={lineHeight} />
    
            })}
            </div>
            <div className={styles.dataTable}>
                {scaleMarks.filter((scaleMark) => scaleMark.isData).map((scaleMark) => {
                  return <span>{"time: " + scaleMark.name + ". percentage: " + scaleMark.percentage}</span>
                })}
            </div>
        </div>

    )
}

function ScaleMark(props) {
    const [markName, setMarkName] = useState(() => props.markName)
    const [percentage, setPercentage] = useState(() => props.percentage);
    const [parentHeight, setParentHeight] = useState(() => props.parentHeight);

    const [scaleMarkHeight, setScaleMarkHeight] = useState(20);
    const [scaleMarkWidth, setScaleMarkWidth] = useState(0);
    const scaleMarkRef = useRef(null);
    useLayoutEffect(() => {
        const scaleMarkElement = scaleMarkRef.current;
        const scaleMarkCoords = scaleMarkElement.getBoundingClientRect();
        const scaleMarkWidth = scaleMarkCoords.right - scaleMarkCoords.left;

        setScaleMarkWidth(scaleMarkWidth);
    }, [percentage, markName]);

    const [scaleMarks, setScaleMarks] = props.scaleMarksState;
    useEffect(() => {
        let scaleMarksCopy = [...scaleMarks];
        scaleMarksCopy[props.scaleMarksArrayNumber].percentage = percentage;
        let k = scaleMarksCopy.sort((scaleMark1, scaleMark2) => {
            console.log( Number(scaleMark1.percentage) > Number(scaleMark2.percentage));
            return Number(scaleMark1.percentage) > Number(scaleMark2.percentage) ? -1 : 1;
        });
        setScaleMarks(k);
        console.log(k,scaleMarks);
    }, [percentage])



    const getMarkHeightInPX = () => (parentHeight*(100 - percentage)/100) - scaleMarkHeight + 'px';
    const getInputSize = (inputValue) => inputValue ? (inputValue+"").length : 1;
    function onPercentageChange(e) {
        let newPercentage = e.target.value;

        if (newPercentage > 100) newPercentage = 100;
        if (newPercentage < 0 || !newPercentage) newPercentage = 0;
        if ((newPercentage + "")[0] === "0" && (newPercentage + "").length === 2) newPercentage = newPercentage.substring(1);
        setPercentage(newPercentage);
    }

    return (
        <div style={{position: "absolute", top: getMarkHeightInPX()}} className={styles.scaleMarkContainer}>
            <div ref={scaleMarkRef} className={styles.scaleMark} style={{height: scaleMarkHeight + "px", position: "relative", left: props.isLeft ? -1*scaleMarkWidth + "px" : "0px"}}>
                <input size={getInputSize(markName)} className={styles.markName} value={markName} onChange={(e) => setMarkName(e.target.value)}/>
                <div className={styles.percentageWrapper}>
                    <input style={{width: getInputSize(percentage) + "ch", position: "relative" }} type="number" value={percentage} onChange={onPercentageChange}></input>
                    <input size={1} value={"%"} readOnly></input>
                </div>
            </div>
        </div>
    )
}

function ScaleMarkAdder (props) {
    const [markName, setMarkName] = useState('');
    const [percentage, setPercentage] = useState(0);

    function handlePercentageInputChange(e) {
        let newPercentage = e.target.value;

        if (newPercentage > 100) newPercentage = 100;
        if (newPercentage < 0 || !newPercentage) newPercentage = 0;
        if ((newPercentage + "")[0] === "0" && (newPercentage + "").length === 2) newPercentage = newPercentage.substring(1);
        setPercentage(newPercentage)
    }
    function handleCreateButtonClick() {
        props.handleScaleMarkCreation({name: markName, percentage: percentage})
    }

    return (
        <div className={styles.scaleMarkAdderContainer}> 
            <div className={styles.inputContainer}>
                <input value={markName} onChange={(e) => setMarkName(e.target.value)}></input>
                <input type={"number"} value={percentage} onChange={handlePercentageInputChange}></input>
            </div>
            <div className={styles.addButton}>
                <button onClick={handleCreateButtonClick}>+</button>
            </div>
        </div>
    )
}

function App() {
  return (
    <div style={{width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems:"center"}}>
      <Timer />
      <ScaleLine height={800}/>
    </div>
  )
}


export default App;

