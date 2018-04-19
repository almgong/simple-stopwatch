import { expect } from 'chai';

import Stopwatch from '../src/Stopwatch';

describe('Stopwatch', () => {
  describe('#getLaps', () => {
    let stopwatch : Stopwatch;
    beforeEach(() => {
      console.log('ok')
      try {
stopwatch = new Stopwatch();
      } catch (err) {
        console.log(err)
      }
      
      console.log('ok2')
    });

    context('when idle', () => {
      it('should return an empty array', () => {

        expect(stopwatch.getLaps()).to.eql([]);
      });
    });

    context('when running', () => {

    });

    context('when stopped', () => {

    });
  });
});