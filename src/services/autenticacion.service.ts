import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Llaves} from '../config/llaves';
import {Persona} from '../models';
import {PersonaRepository} from '../repositories';
const generador = require("password-generator");
const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(/* Add @inject to inject parameters */
    @repository(PersonaRepository)
    public personaRepository: PersonaRepository //para poder trabajar con identificacion de persona necesitamos traer el repositorio
  ) { }

  /*
   * Add service methods here
   */
  GenerarClave() {
    let clave = generador(8, false);
    return clave;
  }

  //cifrar clave

  Cifrarclave(clave: string) {
    let claveCifrada = cryptoJs.MD5(clave).toString();
    return claveCifrada;
  }

  //IDENTIFICACIONDE USUARIOS
  identificarpersona(usuario: string, clave: string) {
    try {
      let p = this.personaRepository.findOne({where: {correo: usuario, clave: clave}});
      if (p) {
        return p
      }
      return false;
    } catch {
      return false;
    }
  }

  //TOKEN
  generarTokenJWT(persona: Persona) {
    let token = jwt.sign({
      data: {
        id: persona.id,
        correo: persona.correo,
        nombre: persona.nombres + " " + persona.apellidos
      }
    },
      //Firma del token debe ser secreta, creamos archivo y una carpena en src-> config->llaves.ts
      Llaves.calveJWT);
    return token;
  }

  validarTokenJWT(token: string) {
    try {
      let datos = jwt.verify(token, Llaves.calveJWT);
      return datos;
    } catch {
      return false;
    }
  }

}
