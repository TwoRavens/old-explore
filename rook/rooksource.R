##
##  rooksource.R
##
##  8/19/15
##


## Define paths for output.
## Also set `production` toggle:  TRUE - Production, FALSE - Local Development.
source("rookconfig.R")



if(is_rapache_mode){
    sink(file = stderr(), type = "output")
    print("system time at source: ")
    print(Sys.time())
}

if(is_rapache_mode) {
    setwd("/var/www/html/dataexplore/rook")
}

if(!production){
    packageList<-c("Rcpp","VGAM", "AER", "dplyr", "quantreg", "geepack", "maxLik", "Amelia", "Rook","jsonlite","rjson", "devtools", "DescTools", "nloptr","XML", "Zelig")
   # install.packages("rpart","readr")
    # Find an available repository on CRAN
    availableRepos <- getCRANmirrors()
    flag <- availableRepos$Country=="USA" & grepl("https",availableRepos$URL,)
    useRepos <- sample(availableRepos$URL[flag],1)

    ## install missing packages, and update if newer version available
    for(i in 1:length(packageList)){
        if (!require(packageList[i],character.only = TRUE)){
            install.packages(packageList[i], repos="http://lib.stat.cmu.edu/R/CRAN/")
        }
    }
    update.packages(ask = FALSE, dependencies = c('Suggests'), oldPkgs=packageList, repos="http://lib.stat.cmu.edu/R/CRAN/")
    install.packages("caret", dependencies = c("Depends", "Suggests"))
    install.packages("rpart", dependencies = c("Depends", "Suggests"))
    install.packages("readr", dependencies = c("Depends", "Suggests"))

}

library(Rook)
library(rjson)
library(jsonlite)
library(devtools)
library(DescTools)


print("All libraries are called ")
#if (!production) {
#    if(!("Zelig" %in% rownames(installed.packages()))) {
#        install_github("IQSS/Zelig")
#    } else if(package_version(packageVersion("Zelig"))$major != 5) {
#        install_github("IQSS/Zelig")
#    }
#}

#!/usr/bin/env Rscript

library(Zelig)
library(rpart)
library(caret)
library(readr)
source(paste(getwd(),"/preprocess/preprocess.R",sep="")) # load preprocess function

modulesPath<-paste(getwd(),"/privacyfunctions/",sep="")

if(addPrivacy){
	source(paste(modulesPath,"DPUtilities.R", sep=""))
	source(paste(modulesPath,"GetFunctions.R", sep=""))
	source(paste(modulesPath,"update_parameters.R", sep=""))
	source(paste(modulesPath,"Calculate_stats.R", sep=""))
	source(paste(modulesPath,"Histogramnew.R", sep=""))
	source(paste(modulesPath,"CompositionTheorems.R", sep=""))
	source(paste(modulesPath,"DP_Quantiles.R", sep=""))
	source(paste(modulesPath,"DP_Means.R", sep=""))
	source(paste(modulesPath,"CreateXML.R", sep=""))
}

if(production){
  myPort <- "8000"
  myInterface <- "0.0.0.0"
}else {
  myPort <- "8000"
  myInterface <- "127.0.0.1"
}

if(!is_rapache_mode){
    status <- -1
    if (as.integer(R.version[["svn rev"]]) > 72310) {
        status <- .Call(tools:::C_startHTTPD, myInterface, myPort)
    } else {
        status <- .Call(tools:::startHTTPD, myInterface, myPort)
    }

    if( status!=0 ){
        print("WARNING: Error setting interface or port")
        stop()
    }   #else{
    #    unlockBinding("httpdPort", environment(tools:::startDynamicHelp))
    #    assign("httpdPort", myPort, environment(tools:::startDynamicHelp))
    #}

    R.server <- Rhttpd$new()

    cat("Type:", typeof(R.server), "Class:", class(R.server))
    #R.server$add(app = File$new(getwd()), name = "pic_dir")

    #rookFilesDir = "/Users/ramanprasad/Documents/github-rp/TwoRavens//data/d3m/o_196seed/data"
    #<- paste(getwd(), "/../data/d3m", sep="");
    print("--- rookFilesDir")
    #print(rookFilesDir)
    #R.server$add(app = File$new(rookFilesDir), name = "rook-files")


    print(R.server)

    if(!production){
      R.server$start(listen=myInterface, port=myPort)
      R.server$listenAddr <- myInterface
      R.server$listenPort <- myPort
    }
}



#source("rookselector.R")
source("rooksubset.R")
source("rooktransform.R")
source("rookzelig.R")
source("rookutils.R")
source("rookdata.R")
#source("rookwrite.R")   # jh - believe this is a legacy of early exploration of user-level metadata
source("rookpreprocess.R")
source("rookpipeline.R")
source("rookhealthcheck.R")
source("rookexplore.R")
source("rooktree.R")
if(addPrivacy){
    source("rookprivate.R")
}


if(is_rapache_mode){
    sink()
}

if(!is_rapache_mode){
    R.server$add(app = zelig.app, name = "zeligapp")
    R.server$add(app = subset.app, name="subsetapp")
    R.server$add(app = transform.app, name="transformapp")
    R.server$add(app = data.app, name="dataapp")
    #R.server$add(app = write.app, name="writeapp")  # jh - believe this is a legacy of early exploration of user-level metadata
    R.server$add(app = preprocess.app, name="preprocessapp")
    R.server$add(app = pipeline.app, name="pipelineapp")
    R.server$add(app = healthcheck.app, name="healthcheckapp")
    R.server$add(app = explore.app, name="exploreapp")
    R.server$add(app = tree.app, name="treeapp")

    # Serve files directly from rook
    R.server$add(app = File$new(PRE_PATH), name = "rook-files")

    if(addPrivacy){
        R.server$add(app = privateStatistics.app, name="privateStatisticsapp")
        R.server$add(app = privateAccuracies.app, name="privateAccuraciesapp")
    }
    #   R.server$add(app = selector.app, name="selectorapp")
    print(R.server)
}



#R.server$browse("zeligapp")
#R.server$stop()
#R.server$remove(all=TRUE)
#mydata<-read.delim("../data/fearonLaitin.tsv")
#mydata<-getDataverse(hostname="dvn-build.hmdc.harvard.edu", fileid="2429360")
#z.out<-zelig(cntryerb~cntryera + dyadidyr, model="ls", data=mydata)
