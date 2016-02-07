# Functional Categorization

When looking at an entire business domain, it can be difficult to pick a starting point for the development of a system 

As any developer will tell you, the smaller a feature is sliced, the more predictable 

Here is a technique for categorizing the functions of a system, in a way that helps you to slice and dice the functions into their smallest possible elements. 

Consider the following hierarchy, exemplified using a vehicle manufacturer domain: 

* **Capabilities**<br/>
The vehicle manufacturer might have capabilities like "Sales", "Servicing" and "Marketing".   
  * **Feature Sets**<br/>
  The "Sales" capability may have features sets like "Inventory sales" and "Made to order".
    * **Features**<br/>
    The "Inventory sales" feature set could have a "Find cars by attributes" feature, and a "Find cars by distance from zip code" feature.
      * **Scenarios**<br/>
      The "Find cars by distance from zip code" feature would probably have scenarios like "Prospect applies a 10m radius filter" and "Prospect applies a nation-wide filter".

Let's see what this structure would look like for the vehicle manufacturer domain, with a few more added examples:
    
* **Sales**
  * Inventory sales
    * Find cars by attributes
      * *Finding by text returns any matching attributes*
      * *...*
    * Find cars by distance from zip code
      * *...*
    * Prefer official dealer inventory
      * *...*
  * Made to Order
    * Configure a model
      * *...*
* **Servicing**
  * Scheduling
    * Schedule an annual checkup
      * *Customer can*
      * *Customer cannot book more than 1 annual checkup*
    * Book an appointment
      * *...*
    * Book a tire-change
      * *...*
  * Parts Fulfilment
    * Order parts from factory
      * *...*
    * Sell parts from warehouse
      * *...*
    * Sell parts from showroom
      * *...*
* **Marketing**
  * 
    * 
      * *...*








## Discussion

When you see a website showing off a product's features, these landing pages are usually referring to the *Feature Set* level. Features in the the context of BDD are more granular that what you see on product landing pages.  







Every business operates within a **Domain**. For example, a car manufacturer's domain includes entities such as dealers, models and owners - to name just a handful.

Within this *domain*, 

When building software systems, you are typically creating a digital representation of the business domain. The user interfaces are a means for controlling or "talking" to the domain.

like a used vehicle search feature for example. The user interface would likely have a set of filters that allow you to search dealers for a new or used car. 

The car 


Because UI's are the point of interaction for users, they tend to be at the front and center. 