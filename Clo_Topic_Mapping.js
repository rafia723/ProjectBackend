const express = require("express");
const { pool } = require("./database");

const Clo_Topic_MappingRouter = express.Router();

Clo_Topic_MappingRouter.post("/addMappingsofCloAndTopic", async (req, res) => {
  const { tid, cloIds } = req.body;

  const insertQuery = "INSERT INTO Clo_Topic_Mapping (clo_id,t_id) VALUES (?, ?)";
  
  // Construct an array of arrays, each containing [clo_id, tid]
  const inserts = cloIds.map(cloId => [cloId, tid]);

  // Execute the insert query for each pair of clo_id and tid
  inserts.forEach(values => {
    pool.query(insertQuery, values, (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        return res.status(500).json({ error: "Post Request Error" });
      }
    });
  });

  res.status(200).json({ message: "Data inserted successfully" });
});


Clo_Topic_MappingRouter.get("/getClosMappedWithTopic/:t_id", (req, res) => {  
  const t_id = req.params.t_id; 
  const getQuery = "SELECT clo_id FROM Clo_Topic_Mapping WHERE t_id = ?";
  pool.query(getQuery,[t_id] ,(err, result) => {
    if (err) {
      console.error("Error retrieving Clos mapped with topic", err);
      res.status(500).send("Get Request Error");
      return;
    }
    const t_ids = result.map(row => row.clo_id);
    res.json(t_ids);
  });
});



Clo_Topic_MappingRouter.post("/getClosMappedWithTopicList", (req, res) => {  
  const { t_ids } = req.body; // Assuming t_ids is an array of t_id

  // Generate placeholders for the list of topic IDs based on the array length
  const placeholders = t_ids.map(() => '?').join(',');

  const getQuery = `SELECT * FROM Clo_Topic_Mapping WHERE t_id IN (${placeholders})`;

  pool.query(getQuery, t_ids, (err, result) => {
    if (err) {
      console.error("Error retrieving Clos mapped with topics", err);
      res.status(500).send("Get Request Error");
      return;
    }
    res.json(result);
  });
});
// Clo_Topic_MappingRouter.delete("/deleteMapping/:t_id/:clo_id", (req, res) => {
//   const t_id = req.params.t_id;
//   const clo_id = req.params.clo_id;

//   const deleteQuery = "DELETE FROM Clo_Topic_Mapping WHERE t_id = ? AND clo_id = ?";
//   pool.query(deleteQuery, [t_id, clo_id], (error, result) => {
//     if (error) {
//       console.error("Error deleting CLO mapping:", error);
//       return res.status(500).json({ error: "Delete Request Error" });
//     }
//     res.status(200).json({ message: "CLO mapping deleted successfully" });
//   });
// });


// Clo_Topic_MappingRouter.post("/addSingleMapping", async (req, res) => {
//   const { clo_id, t_id } = req.body;
//   console.log("Data received:", { clo_id, t_id });

//   const insertSingleMappingQuery = "INSERT INTO Clo_Topic_Mapping (clo_id,t_id) VALUES (?, ?)";
//   const inserts = [clo_id, t_id];
//     pool.query(insertSingleMappingQuery, inserts, (error) => {
//       if (error) {

//         console.error("Error inserting data:", error);
//         return res.status(500).json({ error: "Post Request Error" });
//       }
//     });
//   res.status(200).json({ message: "Data inserted successfully" });
// });

Clo_Topic_MappingRouter.put("/updateCloTopicMapping", (req, res) => {
  const { t_id, cloIds } = req.body;

  const deleteQuery = "DELETE FROM clo_topic_mapping WHERE t_id = ?";
  const insertQuery = "INSERT INTO clo_topic_mapping (clo_id, t_id) VALUES (?, ?)";

  // Delete existing entries for the given q_id
  executeQuery(deleteQuery, [t_id], (deleteError, deleteResults) => {
      if (deleteError) {
          console.error("Error:", deleteError);
          return res.status(500).json({ error: "Delete Request Error" });
      }
      
      // Execute insert queries for each topic
      let insertionErrors = [];
      cloIds.forEach(clo => {
          executeQuery(insertQuery, [clo, t_id], (insertError, insertResults) => {
              if (insertError) {
                  console.error("Error:", insertError);
                  insertionErrors.push(insertError);
              }
          });
      });

      if (insertionErrors.length > 0) {
          return res.status(500).json({ error: "Insertion Errors", details: insertionErrors });
      }

      res.status(200).json({ message: "clo mapping with topic updated successfully" });
  });
});

// Function to execute a SQL query
function executeQuery(query, values, callback) {
  pool.query(query, values, callback);
}


module.exports = Clo_Topic_MappingRouter;

