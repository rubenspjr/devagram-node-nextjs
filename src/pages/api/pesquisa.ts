import type {NextApiRequest, NextApiResponse} from 'next'
import type {respostaPadraoMsg} from '../../../types/respostaPadraoMsg'
import { validarTokenJWT } from '../../../middleware/validarTokenJWT';
import { conectarMongoDB } from '../../../middleware/conectarMongoDB';
import { usuarioModels } from '../../../models/usuarioModels';
import { politicaCORS } from '../../../middleware/politicaCORS';


const pesquisaEndpoint
= async(req : NextApiRequest, res : NextApiResponse <respostaPadraoMsg> | any )=> {

    try {
        if (req.method === 'GET'){
                if(req?.query.id){
                    const usuarioEncontrados = await usuarioModels.findById(req?.query?.id);
                    if(!usuarioEncontrados){
                        return res.status(400).json ({erro : 'Usuario não encontrado'})
                    }
                    usuarioEncontrados.senha = null
                    return res.status(200).json(usuarioEncontrados);

                }else{

                    const {filtro} = req.query;
                    if(!filtro || filtro.length < 2){
                        return res.status(400).json({erro : 'Favor informar pelo menos 2 caracteres para sua busca'})
                    }
        
                    const usuarioEncontrados = await usuarioModels.find({
                        $or:[{nome : {$regex : filtro, $options : 'i'}},
                            {email : {$regex : filtro, $options :'i'}}]
                        
                        //regex usa para procurar partes dos caracteres sequenciar é uma expressao regular
                    });
                    usuarioEncontrados.forEach(usuario =>{
                        usuario.senha = null;
                    })
                    
                    return res.status(200).json(usuarioEncontrados);
                }
        }
        return res.status(405).json({erro: 'Metodo informado não é valido'});

    } catch (e) {
        console.log(e);
            return res.status(500).json({erro : 'Nao foi possivel buscarusuarios'+ e})
    }
}
export default politicaCORS(validarTokenJWT(conectarMongoDB(pesquisaEndpoint)));