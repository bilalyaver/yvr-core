import { Request, Response, NextFunction } from 'express';
import loadSchema from '../../loadSchema';
import { loadModel } from '../../loadModel';

async function createFirstUser(req: Request, res: Response, next: NextFunction) {
    const { name, email, password } = req.body; // Arayüzden gelen veriler
    const userSchema = loadSchema('User');
    const roleSchema = loadSchema('Role');
    const permissionSchema = loadSchema('Permission');

    if (!userSchema || !roleSchema || !permissionSchema) {
        return res.status(404).json({ error: 'Model not found. Please check your schema file' });
    }

    const userModel = loadModel(userSchema);
    const adminExists = await userModel.countDocuments();

    if (adminExists) {
        return res.status(400).json({ error: 'Admin already exists' });
    }

    const roleModel = loadModel(roleSchema);
    const permissionModel = loadModel(permissionSchema);

    try {
        
        // 1. İlk admin için permissions oluşturma

        const permissionData = {
            schemaName: 'all', // Bütün şemalar üzerinde yetkili (veya belirli şemalar eklenebilir)
            actions: { create: true, read: true, update: true, delete: true },
        };

        const adminPermissions = await permissionModel.create(permissionData);

        
        const roleData = {
            name: 'admin',
            description: 'Full access to all resources',
            permissions: [adminPermissions._id], // Admin tüm izinlere sahip
        };

        const adminRole = await roleModel.create(roleData);

        // 3. Şifreyi hash'leme (güvenli hale getirme)

        const userData = {
            name,
            email,
            password: password,
            role: adminRole._id,
        };
        const newAdmin = await userModel.create(userData);

        // 5. Başarılı yanıt döndürme
        return res.status(201).json({ message: 'First admin user created successfully', user: newAdmin });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to create first admin user.' });
    }
}

export default createFirstUser;