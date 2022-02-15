import { Button } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';

/**
 * Component: Collection Flip Buttons
 */
 function FlipButtons({ id }) {

    const flipCards = (id, dir=1) => {
        try{
            let container = document.getElementById(id);
            if(dir===1) container.appendChild(container.childNodes[0]);
            else container.prepend(container.lastElementChild);
        }
        catch(error){
            console.error("[CAUGHT] flipCards() Exception:", {id, error})
        }
    }

    return (
        <div className="flip_buttons">
        <Button className="lightUp" title="Back" onClick={(evt) => { evt.stopPropagation(); flipCards(id, 0); return false; }}  
            style={{zIndex:'102'}} icon={<LeftOutlined />}></Button>
            
        <Button className="lightUp" title="Next" onClick={(evt) => { evt.stopPropagation(); flipCards(id); return false; }} 
            style={{zIndex:'102'}} icon={<RightOutlined />}></Button>
        </div>
    );
}//FlipButtons()

export default FlipButtons;
