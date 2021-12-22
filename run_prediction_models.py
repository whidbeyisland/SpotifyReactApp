import base64
import io
import json
import os
import gdown
#import fastbook
#fastbook.setup_book()
import fastai
import pandas as pd
import requests
import torchtext
import nltk
import snscrape.modules.twitter as sntwitter
from copy import deepcopy

from torchvision import models
from torchvision import transforms
from PIL import Image
from django.shortcuts import render
from django.conf import settings
#from fastbook import *
from torchtext.data import get_tokenizer
from fastai.imports import *
from fastai.tabular.all import *
from fastai.tabular import *
from fastai.collab import *

nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')
from nltk.corpus import wordnet
from nltk import FreqDist
from string import punctuation
import mmap

import pathlib
posixpath_temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath

import sys

cat_names = ['Pop', 'Rock', 'Country', 'Metal', 'Jazz', 'HipHop', 'JPop', 'Chiptune', 'Trance', 'House', 'R&B', 'KPop']
procs = [Categorify, FillMissing, Normalize]
path_cwd = os.getcwd()
path_df = 'pytorch_assets\\dataframes'
path_dls = 'pytorch_assets\\dataloaders'
path_models = 'pytorch_assets\\models'



class RunPredictionModels:
    def __init__(self):
        print('got here 2')
        # pass

    def fileize(self, name):
        lower_name = name.lower()
        name_ltrs = re.sub('[^a-zA-Z]', '_', lower_name)
        return name_ltrs

    def initialize_assets(self):
        # mocked data right now for correlations between liking each genre and liking other genres
        df = pd.read_csv(os.path.join(path_df, 'mock_music_data_5.csv'))
        print(df.shape)

        # for each genre: create a list of all the *other* genres to predict whether or not the user will like
        cat_names_eachgenre = []
        for i in range(0, len(cat_names)):
            cat_names_thisgenre = deepcopy(cat_names)
            cat_names_thisgenre.remove(cat_names[i])
            cat_names_eachgenre.append(cat_names_thisgenre)

        print('dataloaders')
        dls_eachgenre = []
        try:
            for i in range(0, len(cat_names)):
                dls_thisgenre = torch.load(os.path.join(path_cwd, path_dls, 'dls-tab-0001-' + self.fileize(cat_names[i]) + '.pkl'))
                dls_eachgenre.append(dls_thisgenre)
                # dls_thisgenre = TabularDataLoaders.from_df(df, y_names=cat_names[i],  
                #                                 cat_names = cat_names_eachgenre[i],
                #                                 procs = procs,
                #                                 bs=3,
                #                                 y_block = CategoryBlock())
                # dls_eachgenre.append(dls_thisgenre)
                # torch.save(dls_thisgenre, os.path.join(path_df, ('dls-tab-0001-' + self.fileize(cat_names[i]) + '.pkl')))
        except Exception as e:
            print(e)
        
        print('learners')
        tab_learn_eachgenre = []
        try:
            for i in range(0, len(cat_names)):
                print(i)
                tab_learn_thisgenre = tabular_learner(dls_eachgenre[i], metrics=accuracy)
                tab_learn_thisgenre.path = Path(str(path_cwd))/'pytorch_assets'
                tab_learn_thisgenre.load('learn-tab-0001-' + self.fileize(cat_names[i]))
                # tab_learn_thisgenre.fit_one_cycle(1, lr_max=1e-2)
                # tab_learn_thisgenre.save('learn-tab-0001-' + self.fileize(cat_names[i]))
                # tab_learn_thisgenre.export('learn-tab-0001-' + self.fileize(cat_names[i]) + '.pkl')
                # tab_learn_thisgenre = tab_learn_thisgenre.load('learn-tab-0001-' + self.fileize(cat_names[i]), strict=False)
                tab_learn_eachgenre.append(tab_learn_thisgenre)
        except Exception as e:
            print(e)
        
        print('row')
        # coati: replace this with the user's liked genres as populated from
        # the string passed here, just using this mocked data right now for testing
        row = pd.DataFrame({'Rock': [float(1)],
                    'Pop': [float(1)],
                    'Country': [float(0)],
                    'Metal': [float(0)],
                    'Jazz': [float(0)],
                    'HipHop': [float(0)],
                    'JPop': [float(0)],
                    'Chiptune': [float(1)],
                    'Trance': [float(1)],
                    'House': [float(1)],
                    'R&B': [float(0)],
                    'KPop': [float(1)]})
        
        print('preds')
        try:
            # print(type(tab_learn_eachgenre[5])) # TabularLearner
            preds = tab_learn_eachgenre[5].get_preds(dl=row)
            print(type(preds))
        except Exception as e:
            print(e)
