class Rule(object):
    def __init__(self, prior, antecedent):
        self.prior = prior
        self.antecedent = antecedent

    def getPrior(self):
        return self.prior

    def getAntecedent(self):
        return self.antecedent

    def __str__(self):
        retStr = ""
        retStr += self.prior
        retStr += " -> "
        retStr += self.antecedent
        return(retStr)