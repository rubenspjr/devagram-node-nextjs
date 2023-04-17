import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next'
import type {respostaPadraoMsg} from '../types/respostaPadraoMsg'
import NextCors from 'nextjs-cors';

export const politicaCORS = (handler : NextApiHandler)=>
        async (req : NextApiRequest, res : NextApiResponse <respostaPadraoMsg>) => {
        try {
            await NextCors(req, res, {
                origin : '*',
                methods : ['GET', 'POST','PUT'],
                optionSuccessStatus : 200, // navegadores antigos dao erro quando usar 204
            });

            return handler(req,res);
        } catch (e) {
            console.log ('Erro ao tratar a politica CORS:',e);
            return res.status(500).json({erro : 'Ocorreu erro ao tratar a politica CORS.'})
        }


    }