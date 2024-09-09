import { Request, Response, NextFunction } from 'express';

import axios from 'axios';

interface Info {
    nodeVersion: string;
    cmsPackageVersion: string;
}

async function informations(req: Request, res: Response, next: NextFunction) {

    const nodeVersion = process.version;
    const response = await axios.get(`https://registry.npmjs.org/yvr-cms/latest`);

    const cmsPackageVersion = `v${response.data.version}`;
    const info: Info = {
        nodeVersion,
        cmsPackageVersion
    };

    if (nodeVersion && cmsPackageVersion) {
        res.json(info);
    }
}

export default informations;