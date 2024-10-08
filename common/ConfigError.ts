import { red, bold, underline } from 'colorette';

class ConfigError extends Error {
    constructor(message: string) {
        // Hata mesajını renklendirilmiş ve biçimlendirilmiş bir şekilde oluşturuyoruz
        const errorMessage = `${bold(underline(red('yvr-core Configuration Error')))}: ${message}`;
        super(errorMessage);

        // Hatanın ismini belirliyoruz
        this.name = 'ConfigError';
    }

    // Hatanın JSON formatında döndürülmesi için bir metot ekliyoruz
    toJSON() {
        return {
            name: this.name,
            message: this.message,
        };
    }
}

export default ConfigError;