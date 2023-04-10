import type{NextApiRequest, NextApiResponse}from 'next';
import { conectarMongoDB } from '../../../middleware/conectarMongoDB';
import type {respostaPadraoMsg} from '../../../types/respostaPadraoMsg'
import md5 from 'md5';
import { usuarioModels } from '../../../models/usuarioModels';
import jwt from 'jsonwebtoken';
import type {loginResposta} from '../../../types/loginResposta'


const endpointLogin =  
    async (req:NextApiRequest, res:NextApiResponse<respostaPadraoMsg | loginResposta>) => {

        const {MINHA_CHAVE_JWT} = process.env;

        if(!MINHA_CHAVE_JWT){
            return res.status(500).json({erro : 'ENV Jwt nao informada'});
        }

    if(req.method === 'POST'){
        const {login, senha} = req.body;

        const usuariosEncontrados = await usuarioModels.find ({email:login,senha : md5(senha)})
        if( usuariosEncontrados && usuariosEncontrados.length > 0){
                    const usuarioEncontado =  usuariosEncontrados[0];

         const token = jwt.sign({_id: usuarioEncontado._id}, MINHA_CHAVE_JWT);
         
                   return res.status(200).json({
                    nome : usuarioEncontado.nome,
                    email : usuarioEncontado.email,
                    token})

        }

        return res.status(400).json({erro: 'Usuario ou senha invalidos'})

    }
    return res.status(405).json({erro : 'Metodo informado não é valido'});
}
export default conectarMongoDB(endpointLogin);