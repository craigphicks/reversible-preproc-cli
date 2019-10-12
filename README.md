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


Options must be preceded by one or two '-' (short or long both, 1 or 2)
Options must not be concatenated; to each its own hyphen(s). 
Some options can be repeated.

-i --infile <filename> 
    The file to be transformed.  If omitted stdin will be used.

-o --outfile <filename>
    The file to which to write the transformed data. If omitted \
stdout will be used.

-df --deffile [key] <filename>
    A file containing JSON data which will be assigned to the "defines"\
data passed to the reversible-preproc process.
    If the optional [key] is present, defines[key] is the receiver of assignment,\
otherwise defines top-level is the receiver.  
    Assignment is using the Object.assigns() operation unless the rhs is \
not an "true" object (typeof !=== 'object || instanceof Array)
    Can be used multiple times, overwriting / merging with previous assignments,\
in the command line order

-dl --defline [key] <inline JSON>
    To pass the JSON defines inline.  Otherwise same as 'deffile'

-de --defenv [key] 
    Use process.env as the data to assign.  
    IMPORTANT: If [key] is not present the key 'env' will be automatically created for it,\
it will NOT be assigned to defines top-level. Otherwise same as 'deffile'

-v, --version
    Print version number and quit 

-h, --help
    Show this help and quit.
    Running the program with no arguments will result in same behavior. 

-p, -pipe
    If no options at all are provided, the program \
will show help and quit.  Using '-p' prevents that behavior,\
so it can used shell redirection and piping , e.g.
        % rpp-cli -p < fileIn > fileOut\
    Note that '-p' is not necessary if any argument is passed, e.g.
        % rpp-cli -df fileDefines < fileIn > fileOut
    works without '-p' 

For complete documentation with preprocessing grammar see 
    https://www.npmjs.com/package/reversible-preproc
and 
    https://www.npmjs.com/package/reversible-preproc-cli


