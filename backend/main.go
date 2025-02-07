package main 


import (
    "log"
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "github.com/gin-contrib/cors"

    database "backend/database"
    routes "backend/routes"
    middleware "backend/middleware"
)


func main(){
    r := gin.Default()

    err := godotenv.Load()
    if err != nil {
        log.Fatalf("Error loading .env file")
    }

    r.Use(cors.New(cors.Config{
       AllowOrigins:     []string{"http://localhost:5173"},
       AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
       AllowHeaders:     []string{"Origin", "Content-Type"},
       AllowCredentials: true,
   }))

    
    err = database.InitDb()
    if err != nil {
        log.Fatalf("failed to initialize database: %v", err)
    }

    defer database.DB.Close()
    
    router := r.Group("/api") 
    {
        protected := router.Group("/") 
        protected.Use(middleware.AuthMiddleware())
        {
        router.POST("/add_contact", routes.AddContact)
        router.POST("/add_organization", routes.AddOrg)
        router.GET("/all_data", routes.AllData)
        router.GET("/org_types", routes.GetOrgTypes)
        router.PUT("/edit_contact", routes.ChangeInfo)
        router.DELETE("/delete_contact/:id", routes.DeleteContact)
        }
    }


   r.Run(":8080")
}
