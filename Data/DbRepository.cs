using System;
using System.Data;
using Dapper;
using MySql.Data.MySqlClient;

namespace TriangleDbRepository
{
    public class DbRepository
    {
        private IDbConnection _dbConnection;

        public DbRepository(IConfiguration config)
        {
            _dbConnection = new MySqlConnection(config.GetConnectionString("DefaultConnection"));
        }


        public void OpenConnection()
        {
            //if there is no connection to the DB
            if (_dbConnection.State != ConnectionState.Open)
            {
                //Create new connection to the db
                _dbConnection.Open();
            }
        }

        public void CloseConnection()
        {
            _dbConnection.Close();
        }

        //parameters = query parameters
        public async Task<IEnumerable<T>> GetRecordsAsync<T>(string query, object parameters)
        {
            try
            {
                OpenConnection();

                //Query - Method from dapper
                //Query<RETURN_TYPE>();
                IEnumerable<T> records = await _dbConnection.QueryAsync<T>(query, parameters, commandType: CommandType.Text);

                CloseConnection();
                return records;
            }
            catch (Exception ex)
            {
                CloseConnection();
                throw;
            }
        }

        public async Task<bool> SaveDataAsync(string query, object parameters)
        {
            try
            {
                //פתיחת חיבור לבסיס הנתונים
                OpenConnection();

                //ביצוע שאילתה (מחיקה/הוספה/עדכון) של נתונים
                //מוחזר מספר השורות שהשתנו בעקבות השאילתה
                int records = await _dbConnection.ExecuteAsync(query, parameters, commandType: CommandType.Text);

                //סגירת חיבור לבסיס הנתונים
                CloseConnection();

                //במידה והשתנו שורות, מוחזר true, אחרת, מוחזר false
                if(records > 0)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                //במידה והעדכון לא הצליח תופיע הודעת שגיאה
                CloseConnection();
                throw;
            }
        }

        public async Task<int> InsertReturnId(string query, object parameters)
        {
            try
            {
                OpenConnection();
                int results = await _dbConnection.ExecuteAsync(query, parameters, commandType: CommandType.Text);

                if (results > 0)
                {
                    int Id = _dbConnection.Query<int>("SELECT last_insert_id()").FirstOrDefault();
                    CloseConnection();
                    return Id;
                }
                CloseConnection();
                return 0;
            }
            catch (System.Exception)
            {
                CloseConnection();
                throw;
            }
        }

    }
}

