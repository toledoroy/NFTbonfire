import { useEffect, useState, useContext } from "react";
import { Skeleton, Button, Dropdown, Avatar } from "antd";
// import { Link } from "react-router-dom";
import { DownOutlined } from '@ant-design/icons'; //UserOutlined
import { Persona } from "objects/Persona";
import BusinessCard from "components/Persona/BusinessCard";
import { PersonaHelper } from "helpers/PersonaHelper";
import { PersonaContext } from "common/context";


/**
 * Component
 * @param object persona    Current Persona
 * @param array personas    All Personas Owned by User
 */
 function PersonaChanger(props) {
    const { persona, personas } = props;
    const { persona:curPersona, setPersona} = useContext(PersonaContext);

    //Use Persona Model
    const personaObj = new Persona(persona);
    const image = personaObj.getFallback('image');
    return (
      <Avatar size={60} src={PersonaHelper.getImage(curPersona)} />
    );
    return (
      <Dropdown trigger={['click']} className="popPanel" style={{}} overlay={
        <div className="business_card_container">
          {Object.values(personas).map((NFTpersona, index) => {
            //Wrap
            let PersonaObject = new Persona(NFTpersona);
            console.warn("[TEST] NFTCollection() This PersonaObject", PersonaObject);
            return (
              <BusinessCard key={index} persona={PersonaObject} metadata={NFTpersona.metadata} className="item"/>
            );
          })}
        </div>
        }>
        <Button style={{height:'auto',}} className="card_wrapper">
          <span>I am</span>
          {/* <BusinessCard persona={new Persona(persona)} metadata={persona?.metadata} className="item" /> */}
          <Avatar size={60} src={image} />
          <DownOutlined style={{margin:'auto'}}/>
        </Button>
      </Dropdown>
    );
  }//PersonaChanger()

  
export default PersonaChanger;
