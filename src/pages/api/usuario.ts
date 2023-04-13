import type {NextApiRequest, NextApiResponse} from 'next';
import type {respostaPadraoMsg} from '../../../types/respostaPadraoMsg';
import {validarTokenJWT} from '../../../middleware/validarTokenJWT';
import {conectarMongoDB} from '../../../middleware/conectarMongoDB'
import { usuarioModels } from '../../../models/usuarioModels';


const usuarioEndpoint = async (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg | any>) =>{

    try {
        // como eu pego os dados do usuario logado?
        //id do usuario
    const {userId} = req?.query;
        // buscando todos os dados do usario
        const usuario = await usuarioModels.findById(userId);
            usuario.senha = null;
            return res.status (200).json (usuario)


        
    } catch (e) {
        console.log(e);
            return res.status(400).json({erro : 'Nao foi possivel obter dados do usuario'})
        
    }
    
}

export default validarTokenJWT(conectarMongoDB(usuarioEndpoint));