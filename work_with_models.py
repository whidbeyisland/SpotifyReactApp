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
from fastai.text.all import *

nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')
from nltk.corpus import wordnet
from nltk import FreqDist
from string import punctuation
import mmap

from .forms import TextEntryForm
from .download_pkls import *
from .tweet_manipulations import TweetManipulations

import pathlib
posixpath_temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath



subs = ['academic-humanities', 'academic-stem', 'anime', 'astrology', 'conservative', 'hippie-spiritual', 'kpop', 'lgbtq', 'liberal', 'sports', 'tech-nerd']
path_cwd = os.getcwd()
path_df = 'static\\dataframes'
path_dls = 'static\\dataloaders'
path_models = 'static\\models'
path_nums200 = 'static\\nums200'
path_toks200 = 'static\\toks200'
path_tweets = 'static\\tweets-by-user'
max_tweets = 999
tweets_to_analyze = 100
num_to_return = 3

def get_tweets(df):
    return L(df.iloc[i, 0] for i in range(0, df.shape[0]))

def subword(sz):
    sp = SubwordTokenizer(vocab_sz=sz)
    sp.setup(txts)
    return ' '.join(first(sp([txt]))[:40])

class WorkWithModels: 
    d = None
    t = None

    df_eachsub = []
    tkn_eachsub = []
    txts_eachsub = []
    toks200_eachsub = []
    nums200_eachsub = []
    dls_eachsub = []
    learn_eachsub = []
    # learn = None

    df_c = None
    tkn_c = None
    toks200_c = None
    nums200_c = None
    dls_c = None
    learn_c = None

    subs_eachuser = dict()

    df_user = None
    txts_user = []
    toks200_user = None
    num_user = None
    rare_words_user = []

    def __init__(self, d, t):
        self.d = d
        self.t = t
    
    

    # methods to get user's distinctive vocabulary
    def get_user_assets_ready(self, username):
        spacy = WordTokenizer()
        tkn = Tokenizer(spacy)

        self.df_user = pd.read_csv(os.path.join(path_tweets, 'tweets-' + username + '.csv'), index_col=0)
        self.df_user.columns = ['Content']
        self.txts_user = L(self.df_user.iloc[i, 0] for i in range(0, self.df_user.shape[0]))

        self.toks200_user = self.txts_user.map(tkn)
        self.num_user = Numericalize()
        self.num_user.setup(self.toks200_user)
        coll_repr(self.num_user.vocab,20)

    def get_rare_words(self, username):
        # coati: should specifically look through the *user's* texts, i.e. have user-specific assets loaded from
        # .pkl's (or if you're only storing the user's vocabulary, a .txt)

        with open(Path(str(path_df))/'common_words.txt', 'rb', 0) as f, \
            mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ) as s:
            for word in self.num_user.vocab:
                if len(word) >= 4:
                    if word[0] != '@' and word[0:2] != 'xx' and word not in ['t.co', 'https']:
                        lemma = word
                        if word[-1:] in ['d', 's']: lemma = word[:-1]
                        elif word[-2:] in ['er', 'in', 'st', 'th', 'ty']: lemma = word[:-2]
                        elif word[-3:] in ['ing']: lemma = word[:-3]
                        if not s.find(lemma[:-1].encode()) != -1:
                            self.rare_words_user.append([word, self.get_POS(word, username)])
            # coati: maybe store these variables differently?
            self.t.rare_words_user = self.rare_words_user

    def get_POS(self, word, username):
        for i in range(0, len(self.txts_user)):
            tweet = self.txts_user[i].split()
            if word in tweet:
                index = tweet.index(word)
                pos_tweet_predicted = nltk.tag.pos_tag(tweet)
                # print(pos_tweet_predicted)
                pos_word_predicted = pos_tweet_predicted[index]
                return pos_word_predicted[1]
        return 'NN'
    
    # coati: not currently using this
    def get_syns_rare_words(self, username):
        try:
            for i in range(0, len(self.rare_words_user)):
                word = self.rare_words_user[i][0]
                syns = self.t.find_syns(word)
                if len(syns) > 0:
                    print('Synonyms for ' + word + ': ' + ' '.join(syns))
        except Exception as e:
            print(e)
    
    def get_vocab_of_learner(self, sub_index):
        try:
            num = Numericalize()
            num.setup(self.toks200_eachsub[sub_index])
            return num.vocab
        except Exception as e:
            print(e)
            return []

    def get_categorization_assets_ready(self):
        print('Getting assets for categorization, hang tight................')
        print('Loading dataframes...')
        try:
            self.df_c = torch.load(os.path.join(path_cwd, path_df, 'df_categorize.pkl'))
        except Exception as e:
            print(e)

        spacy = WordTokenizer()
        tkn = Tokenizer(spacy)
        self.tkn_c = tkn

        print('Loading txts...')
        self.txts_c = L(self.df_c.iloc[i, 0] for i in range(0, self.df_c.shape[0]))

        # print('Loading toks200...')
        # try:
        #     #COATI: host this online so you can download it, currently it has no way of getting to the project
        #     self.toks200_c = torch.load(os.path.join(path_cwd, path_toks200, 'toks200_c.pkl'))
        # except Exception as e:
        #     print(e)

        # print('Loading nums200...')
        # try:
        #     #COATI: host this online so you can download it, currently it has no way of getting to the project
        #     self.nums200_c = torch.load(os.path.join(path_cwd, path_nums200, 'nums200_c.pkl'))
        # except Exception as e:
        #     print(e)

        print('Loading dataloaders...')
        try:
            self.d.download_dls_c()
            self.dls_c = torch.load(os.path.join(path_cwd, path_dls, 'dls-nlp-clas.pkl'))
        except Exception as e:
            print(e)
        
        print('Loading learners...')
        try:
            print('Attempt 2')
            self.d.download_learn_c_pth()
            self.learn_c = text_classifier_learner(self.dls_c, AWD_LSTM, drop_mult = 0.5, metrics = accuracy).to_fp16()
            # self.learn_c.path = Path(str(os.path.join(path_cwd, path_models)))
            self.learn_c.path = Path(str(path_cwd))/'static'
            # self.learn_c.path = Path(str(path_cwd)/'static')
            self.learn_c = self.learn_c.load('nlpmodel3_clas')
        except Exception as e:
            print(e)
        
        print('Success!')

    def get_generation_assets_ready(self):
        print(self.d.testfunc())
        print('Getting assets for tweet generation, hang tight................')
        print('Loading dataframes...')
        try:
            self.df_eachsub = torch.load(os.path.join(path_cwd, path_df, 'df_eachsub_tweets.pkl'))
            print(str(len(self.df_eachsub)))
        except Exception as e:
            print(e)
        
        spacy = WordTokenizer()
        for i in range(0, len(subs)):
            tkn = Tokenizer(spacy)
            self.tkn_eachsub.append(tkn)
        
        print('Loading txts...')
        try:
            self.txts_eachsub = torch.load(os.path.join(path_cwd, path_df, 'txts_eachsub.pkl'))
            print(str(len(self.txts_eachsub)))
        except Exception as e:
            print(e)
        # coati: TO DO................ store txts_eachsub.pkl on drive so you can download it, currently the program has
        # no way of creating it

        print('Loading toks200...')
        try:
            self.d.download_toks200()
            self.toks200_eachsub = torch.load(os.path.join(path_cwd, path_toks200, 'toks200-tweets.pkl'))
            print(str(len(self.toks200_eachsub)))
        except Exception as e:
            print(e)

        print('Loading nums200...')
        try:
            self.d.download_nums200()
            self.nums200_eachsub = torch.load(os.path.join(path_cwd, path_nums200, 'nums200-eachsub.pkl'))
            print(str(len(self.nums200_eachsub)))
        except Exception as e:
            print(e)
        
        print('Loading dataloaders...')
        try:
            for i in range(0, len(subs)):
                filename = 'dls-nlp-' + subs[i] + '-ALT.pkl'
                dls_thissub = torch.load(os.path.join(path_cwd, path_dls, filename))
                self.dls_eachsub.append(dls_thissub)
            print(str(len(self.dls_eachsub)))
        except Exception as e:
            print(e)

        print('Loading learners...')
        try:
            self.d.download_all_models()
            for i in range(0, len(subs)):
                try:
                    filename = 'nlpmodel3-' + subs[i] # don't include ".pth" in filename --- model.learn() doesn't require it
                    learn = language_model_learner(
                        self.dls_eachsub[i], AWD_LSTM, drop_mult=0.3, 
                        metrics=[accuracy, Perplexity()]).to_fp16()
                    learn.path = Path(str(path_cwd))/'static'
                    learn = learn.load(filename)

                    # learn = torch.load(os.path.join(path_cwd, path_models, filename))
                    self.learn_eachsub.append(learn)
                    print('Successfully loaded model ' + str(i))
                except:
                    print('Failed to load model ' + str(i))
            print('Loaded')
        except Exception as e:
            print(e)
        
    def download_user_tweets(self, username):
        print('Downloading tweets by user ' + username + '...')

        tweets_list = []

        for i,tweet in enumerate(sntwitter.TwitterSearchScraper('from:' + username).get_items()): 
            if i > max_tweets:
                break
            tweets_list.append([tweet.content])
            # racc: tweets_list.append([tweet.date, tweet.id, tweet.content, tweet.user.username])
 
        tweets_df = pd.DataFrame(tweets_list, columns=['Content'])
        tweets_df.to_csv(os.path.join(path_tweets, 'tweets-' + username + '.csv'))

        # coati: if this version of snscrape stops working, another way to do it:

        # scraper = snscrape.modules.twitter.TwitterUserScraper('textfiles')
        # for tweet in scraper.get_items():
        #     print(tweet.user.username)
        #     print(tweet.date)
        #     print(tweet.content)

        # os.system('snscrape --max-results ' + str(max_tweets) + ' twitter-user ' + username + ' >tweets-by-user-' + username + '.txt')

    def categorize_user(self, username):
        subs_thisuser = []

        try:
            self.download_user_tweets(username)

            # coati: uncomment this if you get rid of "get_user_assets()" method
            # self.df_user = pd.read_csv(os.path.join(path_tweets, 'tweets-' + username + '.csv'), index_col=0)
            # self.df_user.columns = ['Content']

            preds_each_tweet = []
            for i in range(0, tweets_to_analyze):
                print('Analyzing tweet #', i)
                preds_this_tweet = self.learn_c.predict(self.df_user.loc[i, 'Content'])[2]
                print(preds_this_tweet)
                preds_each_tweet.append(preds_this_tweet)
            all_preds_each_categ = torch.stack(preds_each_tweet)

            df_preds = pd.DataFrame(all_preds_each_categ.numpy())
            df_preds.columns = subs

            # predictions of subculture for all of the user's tweets
            preds_overall_each_categ = []
            for i in range(0, len(subs)):
                pred_overall_this_categ = df_preds[subs[i]].mean()
                preds_overall_each_categ.append(pred_overall_this_categ)

            # sorting these overall predictions from most to least likely
            preds_overall_each_categ_sorted = deepcopy(preds_overall_each_categ)
            preds_overall_each_categ_sorted.sort(reverse=True)

            for i in range(0, len(preds_overall_each_categ_sorted)):
                cur_pred = preds_overall_each_categ_sorted[i]
                orig_index_of_pred = preds_overall_each_categ.index(cur_pred)
                print('Likelihood of being in group ' + subs[orig_index_of_pred] + ': ' + str(cur_pred))

                # coati: currently just returning top 3 categories --- can make this mechanism more complex later
                if i < num_to_return:
                    subs_thisuser.append(orig_index_of_pred)
                    # racc: switching from names to indices, may cause issues later
                    # subs_thisuser.append(subs[orig_index_of_pred])
        except Exception as e:
            print(e)
        
        self.subs_eachuser[username] = subs_thisuser
        # coati: SAVE THIS SOMEWHERE, like in a csv in the user's copy of the repo
    
    def get_user_styles(self, username):
        # coati: for future: don't include links ("http...", "t.co...") or at's ("@") as uncapitalized tweets,
        # check if user uses emojis
        percent_capitalized = 0
        percent_punctuated = 0
        tweets_to_inspect = 30
        tweets_uncapitalized = 0
        tweets_capitalized = 0
        tweets_punctuated = 0

        try:
            for i in range(0, tweets_to_inspect):
                cur_tweet = self.df_user.loc[i, 'Content'].strip()

                # for checking capitalization of the user's tweets, leave out ones that start with "@"
                if re.match('^[A-Z]', cur_tweet):
                    tweets_capitalized = tweets_capitalized + 1
                elif re.match('^[a-z]', cur_tweet):
                    tweets_uncapitalized = tweets_uncapitalized + 1
                
                if cur_tweet[-1] in punctuation:
                    tweets_punctuated = tweets_punctuated + 1
            
            percent_capitalized = tweets_capitalized / (tweets_capitalized + tweets_uncapitalized)
            percent_punctuated = tweets_punctuated / tweets_to_inspect
            # print(str(percent_capitalized) + '.........' + str(percent_punctuated))
            return [percent_capitalized, percent_punctuated]
        except Exception as e:
            # might be a "divide by zero" error, so just return .5 for both
            return [.5, .5]

    def get_tweet_predictions(self, username, topic):
        num_words = 20
        # coati: for now just 1 sentence, but in the future you can generate multiple and pick the best one by
        # some metric, like BLEU grammatical correctness
        num_sentences = 1

        subs_thisuser = self.subs_eachuser[username]
        preds_manipulated_all_subs = []
        for i in range(0, len(subs_thisuser)):
            cur_sub = subs_thisuser[i]
            intro = self.t.intro_from_prompt(topic, self.rare_words_user)
            preds = self.learn_eachsub[cur_sub].predict(intro, num_words, temperature=0.75)
                # racc: [self.learn_eachsub ... for _ in range(n_sentences)]
            # preds = [self.learn_eachsub[cur_sub].predict(intro, num_words, temperature=0.75) for _ in range(num_sentences)]
            preds_manipulated = self.t.apply_manipulations(preds, topic, self.get_user_styles(username), self.rare_words_user)
            # preds_manipulated = [self.t.apply_manipulations(preds[i], self.rare_words_user) for i in range(0, num_sentences)]
            preds_manipulated_all_subs.append(preds_manipulated)
            # print('-------------------------------------------')
            # print('\n'.join(preds_manipulated))
            # print('-------------------------------------------')
        return preds_manipulated_all_subs
