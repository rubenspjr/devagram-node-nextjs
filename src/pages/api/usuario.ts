import type {NextApiRequest, NextApiResponse} from 'next';
import type {respostaPadraoMsg} from '../../../types/respostaPadraoMsg';
import {validarTokenJWT} from '../../../middleware/validarTokenJWT';
import {conectarMongoDB} from '../../../middleware/conectarMongoDB'
import { usuarioModels } from '../../../models/usuarioModels';
import nc from 'next-connect';
import { upload, uploadImagemCosmic } from '../../../service/uploadImagemCosmic';

    const handler = nc()
    .use(upload.single('file'))
    .put(async (req : any, res : NextApiResponse<respostaPadraoMsg>) => {
        try {
            //eu quero alterar o usuario entao eu tenho que pegar ele
            //no banco de dados primeiro
            const {userId} = req?.query;
            const usuario = await usuarioModels.findById(userId);

            //se usuario retornou algo e pq ele existe 
            // se nao retornou nao existe
            if(!usuario){
                return res.status(400).json({erro : 'Usuario não encontrado'})
            }

            const {nome} = req.body;
            if (nome && nome.length > 2) {
                usuario.nome = nome;
            }

            const {file} = req;
            if(file && file.originalname){
                const image = await uploadImagemCosmic(req);
                if(image && image.media && image.media.url){
                    usuario.avatar = image.media.url;
                } 
            }

           
                //alterando os dados no banco de dados
                await usuarioModels.findByIdAndUpdate({_id: usuario._id}, usuario)
                return res.status(200).json({msg : 'Usuario alterado com sucesso'});


        } catch (e) {
            console.log(e);
            return res.status(400).json({erro : 'Nao foi possivel atualizar usuario' + e});
        }

    })
    .get ( async (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg | any>) =>{
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
        
    })

export const config = {
    api : {
        bodyParser : false
    }
}

    export default validarTokenJWT(conectarMongoDB(handler));