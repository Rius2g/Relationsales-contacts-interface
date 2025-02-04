package routes


import ( 
    "github.com/gin-gonic/gin" 
    "context"
    "time"
    "fmt"
    t "backend/types"
    database "backend/database"
)


func AddOrg(c *gin.Context){
    //add org
    var org t.Organization 
    if err := c.ShouldBindJSON(&org); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second) 
    defer cancel()

    
    fmt.Println(org)
    
    if err := database.DB.AddOrganization(ctx, org); err != nil {
        fmt.Println(err)
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    c.JSON(200, gin.H{"message": "Organization added successfully"})

}


func AddContact(c *gin.Context){
    var contact t.Contact
    if err := c.ShouldBindJSON(&contact); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    } 


    ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second) 
    defer cancel()



    if err := database.DB.AddContact(ctx, contact); err != nil { 
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    c.JSON(200, gin.H{"message": "Contact added successfully"})
}
