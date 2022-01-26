
/**
 * Big Title Manipulation
 * @param {*} props 
 * @returns 
 */
function CarvedHeading(props){
    let text = props.text;
    if(props.heading == 2) return (<h2 className="carved" title={text}>{text}</h2>);
    else return (<h1 className="carved" title={text}>{text}</h1>);
}

export default CarvedHeading;