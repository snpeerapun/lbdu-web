namespace LBDUSite.WebAPI.Models
{

    public enum ConfigurationKey
    {
        EMAIL_SERVER,
        EMAIL_PORT,
        EMAIL_FROM,
        EMAIL_FROMNAME,
        EMAIL_USER,
        EMAIL_PASSWORD,
        OACC_BROKER_ID,
        OACC_BASE_URL,
        OACC_PRIVATE_KEY,
        OACC_PERIOD,
        OACC_STATUS,
        OACC_NDID_STATUS,
        COMPANY_NAME,
        COMPANY_ADDRESS,
        FORMAT_DATE,
        DAP_CLIENT_ID,
        DAP_KEY_NAME,
        DAP_BASE_URL,
        DAP_PRIVATE_KEY,
        DAP_PASSWORD_PDF,
        DOPA_LINK_EXPIRE,
        SYSTEM_NAME
    }

    public enum EventType { 
        READ, 
        MODIFY, 
        DELETE,
        CREATE
    }

}
