import pandas as pd
import sys

class Py_Test:
    def __init__(self, cut_val, fill_val) -> None:
        self.cut_val = cut_val
        self.fill_val = fill_val
    
    def report(self):
        ds = {
            'Cut_Volume': [self.cut_val],
            'Fill_Volume': [self.fill_val]
        }

        df = pd.DataFrame(ds)
        df.to_csv('./backend/reports/report.csv')
        print(df.to_json(orient='records')[1:-1].replace('},{', '} {'))
        sys.stdout.flush()

process = Py_Test(sys.argv[1],sys.argv[2])
process.report()