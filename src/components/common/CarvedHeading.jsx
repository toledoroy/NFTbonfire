
/**
 * Component: Big Title Manipulation
 * @param {*} props 
 * @returns 
 */
function CarvedHeading(props){
    const text = props.text;
    let propsClone = {...props};
    delete propsClone.text;
    if(props.heading === 2) return (<h2 className="carved" title={text} {...propsClone}>{text}</h2>);
    else return (<h1 className="carved" title={text} {...propsClone}>{text}</h1>);
}

export default CarvedHeading;