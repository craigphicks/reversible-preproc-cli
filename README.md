# reversible-preproc-cli

## Outline                                                                                          
                                                                                                    
`reversible-preproc-cli` is a command line interface on top of the 
npm core module 
[`reversible-preproc`](https://www.npmjs.com/package/reversible-preproc).  

The preproc *defines* are supplied as a file input, or on the command line.  
This differs from, for example, C, where the *defines* are 
inscribed in the file to be processed.  The *defines* uses a Javascript style format 
allowing structured properties and values.  E.g., 

```
{
    DEBUG: 2,
    select : 1,
    configs : [{
        A: 1, B: 2 
    }, {
        A: 2, B: 3 
    }]
}
```

The file to processed of course contains conditional statements (conditioned on the *defines*).  
These conditional statements may be written in either of two styles:
 
 - *Psuedo Javascript* ... (which doesn't use eval)
 - *Real javascript functions* ... (which do use eval)

The  *Psuedo Javascript* is briefer and more natural, but the *Real Javascript* is almighty.

For more details about the *defines* and the *conditional statements*, 
see the documentation for *reversible-preproc*
on [npm](https://www.npmjs.com/package/reversible-preproc) 
or [github](https://github.com/craigphicks/reversible-preproc).

The "reversible" moniker indicates that it is suitable for lightweight switching back and forth 
between configuations (e.g., in-place). The deactivated regions are marked with annotated 
comments (//!!) enabling the preprocessor to remove them for a different configuration. 
Repeated applications of the same defines are idempotent.

Regexp is not used. Neither is all text searched. Only lines beginning with comment marks 
(e.g. //), are further processed as potential processing command lines. 
This makes processing relatively fast. 

The rest of this document describes the CLI arguments.

## CLI arguments

 - -i --infile <filename>
    The file to be transformed.  If omitted *stdin* will be used.

 - -o --outfile <filename>
    The file to which to write the transformed data. If omitted
*stdout* will be used.

 - -f --deffile <filename>
    The file containing the JSON variable properties.

 - -l --defline <inline JSON>
    To pass the JSON defines inline.  Due to the need to escape
    quotations marks this option is only usefule for simple cases.

 - -t --testout
    Instead of outputting the transformed input, the output contains
    one line for conditional statement with the form:
    \<T or F\> \<the conditional statement\>



NOTE: Only one, and exactly one, of the '--deffile' and '--defline'
options can/must be used.


changes:
v1.0.1 Mofied to work with Windows style EOL ('\r\n').  
