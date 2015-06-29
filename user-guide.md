# Terminology

## Clause

## Input

## Output

## Value

## Mapping

## Rule

## Operator


# Operations


## How can I know when a contextual menu is available?

Elements which have a context menu show a **special cursor** when passing over them with the mouse cursor.


## How can I add a rule to a decision table?

 - _How can I add a row above / below an existing row?_    
   Either by making a **right-click** and then selecting on one of the arrow present in the menu.
 - _How can I can add a row at the bottom of the table in a single click?_   
   By clicking on the **"plus" icon** at the bottom of the table.



## How can I remove a rule in a decision table?

By making a **right-click** on the rule you want to remove and select the remove action in the menu.



## How can I add an input or output to a decision table?

 - _How can I add a clause left / right to an existing one?_    
   By making a **right-click** in any rule cell.
 - _Should it be possible to add a new clause at the end in a single click? If true, how would it work?_   
   You can add a clause (input or output) by clicking the **"plus" icons** located in the table first row. 
 - _How does the user get visual feedback about which parts of the clause are mandatory to be filled in (validation)?_   
   Empty fields which are required or field values which are not valid are marked with a **warning icon**.


## How can I remove an input / output in a decision table?

By using the menu which opens when making a **right-click** on a rule cell.



## How can I define the name of a clause?

Note: the name has no "execution meaning" but allows the user to understand which data is used by this clause

By clicking in the corresponding cell and typing.


----------------------------------------------------------------------

## How can I define an input expression for a clause?

Note: the input expression is the techincal expression (like Expression Language) which extracts the value against which this clause is tested from the input data.

TBA:
 - Should the input expression always be visible? (Given that it is a "technical" property yet mandatory for execution?)
 - How can I add a very "long" input expression? (Given that it may be any script...)
 - How can can I define the expression / script language of the expression (Javascript, Groovy ...)

## How can I define an item definition?

TBA:
 - How can I define the datatype (string vs. integer ...)
 - How can I provide "allowed values"?

## How can I define the property name of an output clause?

Note: this is the "techinical" variable name to which the output of the given clause is assigned in the output result.
This is required because a rule may have multiple output clauses and there needs to be a way to specify a technical property name to a given
output in the result.

TBA:
- Should it be always visible? (Given that it is a "technical" property yet mandatory for execution?)

## How can I provide input / output Entry values of a clause?

TBA:
- How can I provide a value in a "free text" way?
- How can I choose from a list of allowed values?
- How do I get feedback that the current value is invalid?

TBA Later:
- How can I add an  operator before the value? How can I add multiple operators and /or ranges?

