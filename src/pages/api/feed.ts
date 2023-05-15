import type {NextApiRequest, NextApiResponse} from 'next';
import type {respostaPadraoMsg} from '../../../types/respostaPadraoMsg';
import {conectarMongoDB} from '../../../middleware/conectarMongoDB';
import {validarTokenJWT} from '../../../middleware/validarTokenJWT'
import { usuarioModels } from '../../../models/usuarioModels';
import { publicacaoModels } from '../../../models/publicacaoModels';
import { seguidorModels } from '../../../models/seguidorMoldels';
import { politicaCORS } from '../../../middleware/politicaCORS';


const feedEndpoint = async (req : NextApiRequest, res : NextApiResponse <respostaPadraoMsg | any >) => {
    try {
        if (req.method === 'GET'){
            //receber uma informaçao do id do usuario que 
            //que eu quero buscar o feed
            //onde vem essa informaçao
            //quando usar body e query
            //tudo quer for consulta é no [query] é tudo que envio de informçao e no [body]

            if(req?.query?.id){
                // agora que tenho o id do usuario
                // como eu valido se um usuario é valido
                const usuario = await usuarioModels.findById(req?.query?.id);
                if(!usuario){
                    return res.status(400).json({erro : 'Usuario não encontrado'});
                }
                //e como eu busco as publicaçoes dele ?
                const publicacoes = await publicacaoModels.find({idUsuario : usuario._id}).sort({data : -1});

                const result = []
                for (const publicacao of publicacoes){
                    const usuarioDaPublicacao = await usuarioModels.findById(publicacao.idUsuario);
                    if(usuarioDaPublicacao){
                        const final = {
                            ...publicacao._doc,
                            usuario : usuarioDaPublicacao.nome,
                            avatar: usuarioDaPublicacao.avatar,
                        };
                        result.push(final);
                    }
                }

                    return res.status(200).json(result);
            }
            else{
                const {userId} = req.query;
                const usuarioLogado = await usuarioModels.findById(userId);
                if(!usuarioLogado){
                    return res.status(400).json({erro : 'Usuario nao encontrado'})
                }
                const seguidores = await seguidorModels.find({usuarioId : usuarioLogado._id});
                const seguidoresIds = seguidores.map(s =>s.usuarioSeguidoId);

                const publicacoes = await publicacaoModels.find ({
                    $or : [
                        { idUsuario : usuarioLogado._id},
                        { idUsuario : seguidoresIds}
                        
                    ]
                })
                .sort({data :-1}); // -1 faz as publis ficarem da ultima para primeira e +1 da primeira postada para a ultima
                const result = [];
                for (const publicacao of publicacoes){
                    const usuarioDaPublicacao = await usuarioModels.findById(publicacao.idUsuario);
                    if (usuarioDaPublicacao){
                        const final = {... publicacao._doc, usuario :{
                            nome : usuarioDaPublicacao.nome,
                            avatar : usuarioDaPublicacao.avatar
                        }};
                        result.push(final);
                    }
                }
                return res.status(200).json(result)
            }
        }
        return res.status(400).json({erro : 'Metedo informado nao é valido'})

    } catch (e) {
        console.log(e);
            return res.status(400).json({erro : 'Nao foi possivel obter o feed'})
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(feedEndpoint)));